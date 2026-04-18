<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports.
|
*/

// Phase 8: Live OLT/ONU monitoring — tenant-scoped private channel.
Broadcast::channel('tenant.{tenantId}.fiber', function ($user, $tenantId) {
    if (!$user) return false;
    $userTenant = $user->tenant_id ?? null;
    $isSuper = ($user->role ?? null) === 'super_admin' || ($user->is_super_admin ?? false);
    return $isSuper || ((string) $userTenant === (string) $tenantId);
});
