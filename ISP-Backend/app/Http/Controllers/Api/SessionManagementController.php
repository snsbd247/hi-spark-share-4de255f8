<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminSession;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;

class SessionManagementController extends Controller
{
    /**
     * List current user's active sessions.
     */
    public function mySessions(Request $request)
    {
        $user = $request->admin_user;

        $sessions = AdminSession::where('admin_id', $user->id)
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(fn($s) => [
                'id'            => $s->id,
                'device_name'   => $s->device_name,
                'browser'       => $s->browser,
                'ip_address'    => $s->ip_address,
                'status'        => $s->status,
                'country'       => $s->country,
                'city'          => $s->city,
                'last_activity' => $s->last_activity ?? $s->updated_at,
                'created_at'    => $s->created_at,
                'is_current'    => $s->session_token === ($request->bearerToken() ?: $request->header('X-Session-Token')),
            ]);

        return response()->json($sessions);
    }

    /**
     * Terminate a specific session (logout another device).
     */
    public function terminateSession(Request $request, string $sessionId)
    {
        $user = $request->admin_user;

        $session = AdminSession::where('id', $sessionId)
            ->where('admin_id', $user->id)
            ->first();

        if (!$session) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        $currentToken = $request->bearerToken() ?: $request->header('X-Session-Token');
        if ($session->session_token === $currentToken) {
            return response()->json(['error' => 'Cannot terminate current session'], 400);
        }

        $session->update(['status' => 'terminated']);

        ActivityLogger::log(
            'session_terminated',
            'security',
            "Terminated session from {$session->device_name} ({$session->ip_address})",
            $user->id
        );

        return response()->json(['success' => true]);
    }

    /**
     * Terminate all other sessions (keep current).
     */
    public function terminateOtherSessions(Request $request)
    {
        $user = $request->admin_user;
        $currentToken = $request->bearerToken() ?: $request->header('X-Session-Token');

        $count = AdminSession::where('admin_id', $user->id)
            ->where('session_token', '!=', $currentToken)
            ->where('status', 'active')
            ->update(['status' => 'terminated']);

        ActivityLogger::log(
            'all_sessions_terminated',
            'security',
            "Terminated {$count} other sessions",
            $user->id
        );

        return response()->json(['success' => true, 'terminated_count' => $count]);
    }

    /**
     * Admin: List all active sessions for a tenant.
     */
    public function tenantSessions(Request $request, string $tenantId)
    {
        $sessions = AdminSession::withoutGlobalScopes()
            ->join('users', 'admin_sessions.admin_id', '=', 'users.id')
            ->where('users.tenant_id', $tenantId)
            ->where('admin_sessions.status', 'active')
            ->select('admin_sessions.*', 'users.full_name', 'users.email')
            ->orderBy('admin_sessions.updated_at', 'desc')
            ->limit(100)
            ->get();

        return response()->json($sessions);
    }

    /**
     * Admin: Force terminate a session.
     */
    public function forceTerminate(Request $request, string $sessionId)
    {
        $session = AdminSession::withoutGlobalScopes()->findOrFail($sessionId);
        $session->update(['status' => 'force_terminated']);

        return response()->json(['success' => true]);
    }
}
