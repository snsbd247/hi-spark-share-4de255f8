<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class SuperAdminSession extends Model
{
    use HasUuid;

    protected $fillable = [
        'id', 'super_admin_id', 'session_token',
        'ip_address', 'browser', 'status',
    ];

    public function superAdmin()
    {
        return $this->belongsTo(SuperAdmin::class);
    }
}
