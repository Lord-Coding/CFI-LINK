<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id', 'course_id', 'semestre', 'filiere', 'annee',
        'cc', 'tp', 'exam', 'coef', 'status', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'cc'   => 'float',
            'tp'   => 'float',
            'exam' => 'float',
        ];
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getMoyenneAttribute(): ?float
    {
        $notes = collect([$this->cc, $this->tp, $this->exam])->filter(fn($n) => $n !== null);
        return $notes->count() > 0 ? round($notes->avg(), 2) : null;
    }
}
