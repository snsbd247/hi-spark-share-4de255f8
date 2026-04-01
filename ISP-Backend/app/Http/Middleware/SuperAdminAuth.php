<?php

namespace App\Http\Middleware;

use App\Models\SuperAdminSession;
use Closure;
use Illuminate\Http\Request;

class SuperAdminAuth
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken() ?: $request->header('X-Session-Token');

        if (!$token) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $session = SuperAdminSession::where('session_token', $token)
            ->where('status', 'active')
            ->first();

        if (!$session) {
            return response()->json(['error' => 'Invalid or expired session'], 401);
        }

        $admin = $session->superAdmin;
        if (!$admin || $admin->status !== 'active') {
            return response()->json(['error' => 'Account disabled'], 403);
        }

        if ($admin->isLocked()) {
            return response()->json(['error' => 'Account temporarily locked'], 423);
        }

        // Prevent super admin access from tenant domains
        $host = $request->getHost();
        $resolver = app(\App\Services\TenantResolver::class);
        if (!$resolver->isCentralDomain($host)) {
            return response()->json(['error' => 'Super admin access denied on tenant domain'], 403);
        }

        $session->touch();
        $request->merge(['super_admin' => $admin, 'super_admin_session' => $session]);

        return $next($request);
    }
}
