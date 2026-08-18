<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ScheduleEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'day', 'hour', 'subject', 'room', 'teacher', 'teacher_id',
        'filiere', 'annee', 'option_lic', 'color',
    ];

    public function teacherUser()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
