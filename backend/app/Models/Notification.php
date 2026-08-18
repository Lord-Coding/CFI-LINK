<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = ['user_id', 'target_role', 'type', 'title', 'message', 'read'];

    protected function casts(): array
    {
        return ['read' => 'boolean'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
