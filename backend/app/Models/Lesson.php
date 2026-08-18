<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id', 'title', 'type', 'duration', 'file_url', 'locked', 'order', 'quiz_data',
    ];

    protected function casts(): array
    {
        return [
            'locked'    => 'boolean',
            'quiz_data' => 'array',
        ];
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function progressRecords()
    {
        return $this->hasMany(LessonProgress::class);
    }
}
