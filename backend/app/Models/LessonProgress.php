<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LessonProgress extends Model
{
    protected $fillable = ['student_id', 'lesson_id', 'course_id', 'completed', 'score', 'completed_at'];

    protected function casts(): array
    {
        return [
            'completed'    => 'boolean',
            'completed_at' => 'datetime',
        ];
    }
}
