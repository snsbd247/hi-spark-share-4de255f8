<?php

namespace App\Services;

use App\Models\LoginHistory;

class SuspiciousLoginDetector
{
    /**
     * Analyze a login attempt for suspicious activity.
     *
     * @return array{is_suspicious: bool, reasons: string[]}
     */
    public static function analyze(string $userId, string $ip, ?string $country = null, ?string $device = null, ?string $browser = null): array
    {
        $reasons = [];

        // 1. Check for multiple failed logins in the last 30 minutes
        $failedCount = LoginHistory::withoutGlobalScopes()
            ->where('user_id', $userId)
            ->where('status', 'failed')
            ->where('created_at', '>=', now()->subMinutes(30))
            ->count();

        if ($failedCount >= 3) {
            $reasons[] = "Multiple failed login attempts ({$failedCount} in 30 minutes)";
        }

        // 2. Get last successful login for comparison
        $lastLogin = LoginHistory::withoutGlobalScopes()
            ->where('user_id', $userId)
            ->where('status', 'success')
            ->orderBy('created_at', 'desc')
            ->first();

        if ($lastLogin) {
            // 3. IP change within short timeframe
            if ($lastLogin->ip_address && $lastLogin->ip_address !== $ip) {
                $timeDiff = now()->diffInMinutes($lastLogin->created_at);
                if ($timeDiff < 30) {
                    $reasons[] = "Rapid IP change (from {$lastLogin->ip_address} to {$ip} in {$timeDiff} min)";
                }
            }

            // 4. Country change
            if ($country && $lastLogin->country && $lastLogin->country !== $country) {
                $reasons[] = "New country detected ({$country}, previously {$lastLogin->country})";
            }

            // 5. Device change
            if ($device && $lastLogin->device && $lastLogin->device !== $device) {
                $reasons[] = "Device changed (from {$lastLogin->device} to {$device})";
            }

            // 6. Browser change
            if ($browser && $lastLogin->browser && $lastLogin->browser !== $browser) {
                $reasons[] = "Browser changed (from {$lastLogin->browser} to {$browser})";
            }
        } else {
            // First login ever — not suspicious, just notable
        }

        return [
            'is_suspicious' => count($reasons) > 0,
            'reasons' => $reasons,
        ];
    }
}
