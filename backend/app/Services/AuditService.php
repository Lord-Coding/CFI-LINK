<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;

class AuditService
{
    public function __construct(private ?Request $request = null) {}

    public function log(
        User|null $user,
        string    $action,
        string    $details  = '',
        string    $category = 'system'
    ): AuditLog {
        return AuditLog::create([
            'user_id'    => $user?->id,
            'action'     => $action,
            'details'    => $details,
            'category'   => $category,
            'ip_address' => $this->request?->ip(),
        ]);
    }
}
