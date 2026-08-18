<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CalendarEvent extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'description', 'date', 'time', 'type', 'target_role', 'created_by'];

    protected function casts(): array
    {
        return ['date' => 'date'];
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
