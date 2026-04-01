<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SuperAdmin;
use App\Models\SuperAdminSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SuperAdminAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string|min:4',
        ]);

        $admin = SuperAdmin::where('email', $request->email)
            ->orWhere('username', $request->email)
            ->first();

        if (!$admin) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        // Check lockout
        if ($admin->isLocked()) {
            $minutes = now()->diffInMinutes($admin->locked_until);
            return response()->json([
                'error' => 'Account temporarily locked',
                'locked_for_minutes' => $minutes,
            ], 423);
        }

        if (!Hash::check($request->password, $admin->password_hash)) {
            $admin->increment('failed_attempts');

            // Lock after 5 failed attempts for 15 minutes
            if ($admin->failed_attempts >= 5) {
                $admin->update(['locked_until' => now()->addMinutes(15)]);
            }

            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        // Reset failed attempts
        $admin->update([
            'failed_attempts' => 0,
            'locked_until' => null,
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        $token = Str::uuid()->toString();
        SuperAdminSession::create([
            'super_admin_id' => $admin->id,
            'session_token' => $token,
            'ip_address' => $request->ip(),
            'browser' => $request->header('User-Agent', ''),
        ]);

        return response()->json([
            'user' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'username' => $admin->username,
                'role' => 'super_admin',
            ],
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $session = $request->get('super_admin_session');
        if ($session) {
            $session->update(['status' => 'expired']);
        }
        return response()->json(['success' => true]);
    }

    public function me(Request $request)
    {
        $admin = $request->get('super_admin');
        return response()->json([
            'id' => $admin->id,
            'name' => $admin->name,
            'email' => $admin->email,
            'username' => $admin->username,
            'role' => 'super_admin',
            'two_factor_enabled' => $admin->two_factor_enabled,
        ]);
    }
}
