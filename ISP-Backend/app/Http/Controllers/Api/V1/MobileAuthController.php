<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\User;
use App\Models\UserRole;
use App\Models\CustomRole;
use App\Models\AdminSession;
use App\Models\AdminLoginLog;
use App\Models\Customer;
use App\Models\CustomerSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MobileAuthController extends Controller
{
    use ApiResponse;

    /**
     * POST /api/v1/admin/login
     * Admin/Staff login for mobile app
     */
    public function adminLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
            'device_name' => 'required|string|max:255',
            'device_token' => 'nullable|string', // FCM token for push notifications
        ]);

        $user = User::where('email', $request->email)
            ->orWhere('username', $request->email)
            ->first();

        if (!$user || !$user->password_hash || !Hash::check($request->password, $user->password_hash)) {
            return $this->unauthorized('Invalid credentials');
        }

        if ($user->status !== 'active') {
            return $this->forbidden('Account is disabled');
        }

        $role = UserRole::where('user_id', $user->id)->first();

        // Get permissions
        $permissions = [];
        if ($role && $role->custom_role_id) {
            $customRole = CustomRole::with('permissions')->find($role->custom_role_id);
            if ($customRole) {
                $permissions = $customRole->permissions->map(fn($p) => [
                    'module' => $p->module,
                    'action' => $p->action,
                ])->toArray();
            }
        }

        $sessionToken = Str::uuid()->toString();
        $session = AdminSession::create([
            'admin_id' => $user->id,
            'session_token' => $sessionToken,
            'ip_address' => $request->ip(),
            'browser' => 'Mobile App',
            'device_name' => $request->device_name,
        ]);

        AdminLoginLog::create([
            'admin_id' => $user->id,
            'action' => 'mobile_login',
            'ip_address' => $request->ip(),
            'browser' => 'Mobile App',
            'device_name' => $request->device_name,
            'session_id' => $session->id,
        ]);

        return $this->success([
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->full_name,
                'username' => $user->username,
                'role' => $role->role ?? 'staff',
                'avatar_url' => $user->avatar_url,
                'mobile' => $user->mobile,
                'language' => $user->language ?? 'en',
                'permissions' => $permissions,
            ],
            'token' => $sessionToken,
            'token_type' => 'Bearer',
        ], 'Login successful');
    }

    /**
     * POST /api/v1/admin/logout
     */
    public function adminLogout(Request $request)
    {
        $session = $request->get('admin_session');
        if ($session) {
            AdminLoginLog::create([
                'admin_id' => $session->admin_id,
                'action' => 'mobile_logout',
                'ip_address' => $request->ip(),
                'browser' => 'Mobile App',
                'session_id' => $session->id,
            ]);
            $session->update(['status' => 'expired']);
        }
        return $this->success(null, 'Logged out');
    }

    /**
     * GET /api/v1/admin/me
     */
    public function adminMe(Request $request)
    {
        $admin = $request->get('admin_user');
        $role = UserRole::where('user_id', $admin->id)->first();

        $permissions = [];
        if ($role && $role->custom_role_id) {
            $customRole = CustomRole::with('permissions')->find($role->custom_role_id);
            if ($customRole) {
                $permissions = $customRole->permissions->map(fn($p) => [
                    'module' => $p->module,
                    'action' => $p->action,
                ])->toArray();
            }
        }

        return $this->success([
            'id' => $admin->id,
            'email' => $admin->email,
            'name' => $admin->full_name,
            'username' => $admin->username,
            'role' => $role->role ?? 'staff',
            'avatar_url' => $admin->avatar_url,
            'mobile' => $admin->mobile,
            'staff_id' => $admin->staff_id,
            'language' => $admin->language ?? 'en',
            'permissions' => $permissions,
        ]);
    }

    /**
     * POST /api/v1/tenant/login
     * Customer portal login for mobile
     */
    public function tenantLogin(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'password' => 'nullable|string',
            'device_name' => 'required|string|max:255',
        ]);

        $customer = Customer::where('phone', $request->phone)
            ->orWhere('username', $request->phone)
            ->first();

        if (!$customer) {
            return $this->unauthorized('Customer not found');
        }

        if ($customer->status !== 'active' && $customer->connection_status !== 'active') {
            return $this->forbidden('Account is inactive');
        }

        // Password check with auto-upgrade
        if ($customer->pppoe_password_hash) {
            if (!Hash::check($request->password, $customer->pppoe_password_hash)) {
                return $this->unauthorized('Invalid credentials');
            }
        } elseif ($customer->pppoe_password) {
            if ($request->password !== $customer->pppoe_password) {
                return $this->unauthorized('Invalid credentials');
            }
            // Auto-upgrade to bcrypt
            $customer->update([
                'pppoe_password_hash' => Hash::make($request->password),
            ]);
        } else {
            return $this->unauthorized('No password set. Contact your ISP.');
        }

        $sessionToken = Str::uuid()->toString();
        CustomerSession::create([
            'customer_id' => $customer->id,
            'session_token' => $sessionToken,
            'expires_at' => now()->addDays(30),
        ]);

        return $this->success([
            'customer' => [
                'id' => $customer->id,
                'customer_id' => $customer->customer_id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'email' => $customer->email,
                'area' => $customer->area,
                'status' => $customer->status,
                'connection_status' => $customer->connection_status,
                'monthly_bill' => $customer->monthly_bill,
                'photo_url' => $customer->photo_url,
            ],
            'token' => $sessionToken,
            'token_type' => 'Bearer',
            'expires_at' => now()->addDays(30)->toIso8601String(),
        ], 'Login successful');
    }

    /**
     * POST /api/v1/tenant/logout
     */
    public function tenantLogout(Request $request)
    {
        $session = $request->get('customer_session');
        if ($session) {
            $session->delete();
        }
        return $this->success(null, 'Logged out');
    }

    /**
     * POST /api/v1/admin/refresh
     * Refresh / validate token
     */
    public function refreshToken(Request $request)
    {
        $admin = $request->get('admin_user');
        $session = $request->get('admin_session');
        return $this->success([
            'valid' => true,
            'user_id' => $admin->id,
            'expires_hint' => 'Session is active',
        ], 'Token is valid');
    }
}
