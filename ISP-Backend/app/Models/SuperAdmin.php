<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class SuperAdmin extends Model
{
    use HasUuid;

    protected $fillable = [
        'id', 'name', 'email', 'username', 'password_hash', 'status',
        'failed_attempts', 'locked_until',
        'two_factor_secret', 'two_factor_enabled',
        'last_login_at', 'last_login_ip',
    ];

    protected $hidden = ['password_hash', 'two_factor_secret'];

    protected $casts = [
        'two_factor_enabled' => 'boolean',
        'locked_until' => 'datetime',
        'last_login_at' => 'datetime',
    ];

    public function sessions()
    {
        return $this->hasMany(SuperAdminSession::class);
    }

    public function isLocked(): bool
    {
        return $this->locked_until && $this->locked_until->isFuture();
    }
}
