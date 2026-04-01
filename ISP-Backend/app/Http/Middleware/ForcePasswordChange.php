<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ForcePasswordChange
{
    /**
     * Allowed routes when password change is required.
     */
    protected array $allowedRoutes = [
        'admin/logout',
        'admin/me',
        'admin/force-password-change',
    ];

    public function handle(Request $request, Closure $next)
    {
        $user = $request->get('admin_user');

        if (!$user) {
            return $next($request);
        }

        // Check if user must change password
        if ($user->must_change_password) {
            $currentPath = trim($request->path(), '/');

            // Strip api/ prefix
            $currentPath = preg_replace('/^api\//', '', $currentPath);

            foreach ($this->allowedRoutes as $route) {
                if (str_starts_with($currentPath, $route)) {
                    return $next($request);
                }
            }

            return response()->json([
                'error' => 'password_change_required',
                'message' => 'You must change your password before continuing.',
            ], 403);
        }

        return $next($request);
    }
}
