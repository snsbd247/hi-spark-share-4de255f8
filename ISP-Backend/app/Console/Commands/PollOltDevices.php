<?php

namespace App\Console\Commands;

use App\Models\OltDevice;
use App\Services\Fiber\OltConnector;
use App\Services\Fiber\OnuStatusUpdater;
use Illuminate\Console\Command;

/**
 * Adaptive OLT poller — runs every minute via scheduler, but only polls
 * OLTs whose `last_polled_at + poll_interval_sec` has passed. This makes
 * each OLT independently adaptive without a per-device cron entry.
 *
 * Isolated: only touches olt_devices / onu_live_status / olt_polling_logs.
 */
class PollOltDevices extends Command
{
    protected $signature = 'fiber:poll-olts {--force : Ignore poll_interval, poll all active OLTs}';
    protected $description = 'Adaptive polling of active OLT devices for live ONU status.';

    public function handle(OltConnector $connector, OnuStatusUpdater $updater): int
    {
        // Hard kill-switch — set FIBER_POLLING_ENABLED=false to disable globally.
        if (env('FIBER_POLLING_ENABLED', true) === false) {
            $this->info('Fiber polling disabled by env flag.');
            return self::SUCCESS;
        }

        $now = now();
        $force = (bool) $this->option('force');

        $devices = OltDevice::where('is_active', true)->get();
        $polled = 0; $skipped = 0; $failed = 0;

        foreach ($devices as $device) {
            $interval = max(30, (int) ($device->poll_interval_sec ?: 300));
            $due = $force
                || !$device->last_polled_at
                || $device->last_polled_at->copy()->addSeconds($interval)->lte($now);
            if (!$due) { $skipped++; continue; }

            try {
                $res = $connector->pollOnus($device);
                if (($res['ok'] ?? false) === true) {
                    $persist = $updater->apply($device, $res['onus'] ?? []);
                    $device->update(['status' => 'online', 'last_polled_at' => now()]);
                    $polled++;
                    // Phase 8: live push
                    try {
                        event(new \App\Events\OnuStatusUpdated($device, count($res['onus'] ?? []), $persist));
                    } catch (\Throwable $e) { /* silent */ }
                } else {
                    $device->update(['status' => 'offline', 'last_polled_at' => now()]);
                    $failed++;
                }
            } catch (\Throwable $e) {
                $failed++;
                \Log::warning('OLT poll error: ' . $e->getMessage(), ['olt' => $device->id]);
            }
        }

        $this->info("Polled: {$polled}, skipped: {$skipped}, failed: {$failed}");
        return self::SUCCESS;
    }
}
