<?php

namespace App\Http\Middleware;

use App\Models\Subscription;
use Closure;
use Illuminate\Http\Request;

class CheckSubscription
{
    public function handle(Request $request, Closure $next)
    {
        $tenant = tenant();

        // No tenant context (central domain) → pass through
        if (!$tenant) {
            return $next($request);
        }

        // Check active subscription
        $subscription = Subscription::where('tenant_id', $tenant->id)
            ->where('status', 'active')
            ->where('end_date', '>=', now()->toDateString())
            ->first();

        if (!$subscription) {
            // Check if any subscription exists but expired
            $expired = Subscription::where('tenant_id', $tenant->id)
                ->orderBy('end_date', 'desc')
                ->first();

            if ($expired && $expired->isExpired()) {
                // Auto-suspend tenant
                $tenant->update(['status' => 'suspended']);
                $expired->update(['status' => 'expired']);

                return response()->json([
                    'error' => 'Subscription expired',
                    'message' => 'Your subscription has expired. Please renew to continue.',
                    'expired_at' => $expired->end_date->toDateString(),
                ], 402);
            }

            // No subscription at all — allow for now (trial/free)
            // This ensures backward compatibility for existing tenants
        }

        return $next($request);
    }
}
