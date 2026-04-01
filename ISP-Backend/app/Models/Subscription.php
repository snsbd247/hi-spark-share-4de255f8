<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasUuid;

    protected $fillable = [
        'id', 'tenant_id', 'plan_id', 'billing_cycle',
        'start_date', 'end_date', 'status',
        'amount', 'payment_method', 'transaction_id', 'metadata',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'amount' => 'decimal:2',
        'metadata' => 'array',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function plan()
    {
        return $this->belongsTo(SaasPlan::class, 'plan_id');
    }

    public function isActive(): bool
    {
        return $this->status === 'active' && $this->end_date->isFuture();
    }

    public function isExpired(): bool
    {
        return $this->end_date->isPast();
    }
}
