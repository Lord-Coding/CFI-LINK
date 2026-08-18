<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Message extends Model
{
    use HasFactory;

    protected $fillable = ['from_id', 'to_id', 'subject', 'body', 'read'];

    protected function casts(): array
    {
        return ['read' => 'boolean'];
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'from_id');
    }

    public function recipient()
    {
        return $this->belongsTo(User::class, 'to_id');
    }
}
