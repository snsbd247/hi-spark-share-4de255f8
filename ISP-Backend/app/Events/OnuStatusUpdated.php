<?php

namespace App\Events;

use App\Models\OltDevice;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast after a successful OLT poll → frontend live update without 15s wait.
 * Tenant-scoped private channel: tenant.{tenant_id}.fiber  (or "public.fiber" for null tenant)
 *
 * Listens on Laravel Reverb (Pusher protocol). Falls back gracefully — if Reverb
 * is not configured, broadcasting silently no-ops thanks to BROADCAST_DRIVER=null.
 */
class OnuStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $oltDeviceId;
    public ?string $tenantId;
    public string $oltName;
    public int $count;
    public array $summary;
    public string $polledAt;

    public function __construct(OltDevice $device, int $count, array $summary)
    {
        $this->oltDeviceId = (string) $device->id;
        $this->tenantId = $device->tenant_id ? (string) $device->tenant_id : null;
        $this->oltName = (string) $device->name;
        $this->count = $count;
        $this->summary = $summary; // ['updated'=>..,'inserted'=>..,'linked'=>..,'signal_synced'=>..]
        $this->polledAt = now()->toIso8601String();
    }

    public function broadcastOn(): array
    {
        $channel = $this->tenantId
            ? new PrivateChannel('tenant.' . $this->tenantId . '.fiber')
            : new Channel('public.fiber');
        return [$channel];
    }

    public function broadcastAs(): string
    {
        return 'onu.status.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'olt_device_id' => $this->oltDeviceId,
            'olt_name' => $this->oltName,
            'count' => $this->count,
            'summary' => $this->summary,
            'polled_at' => $this->polledAt,
        ];
    }
}
