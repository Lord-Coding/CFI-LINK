<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'nom_complet', 'email', 'password',
        'role', 'is_active', 'payment_blocked',
        'filiere', 'annee', 'option_lic',
        'specialite', 'grade',
        'service', 'staff_role',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
            'payment_blocked'   => 'boolean',
        ];
    }

    // ── Scopes de rôles ──────────────────────────────────────────
    public function scopeAdmins($query)
    {
        return $query->whereIn('role', ['super_admin', 'admin']);
    }

    public function scopeStudents($query)
    {
        return $query->whereIn('role', ['etudiant_concours', 'etudiant_externe']);
    }

    public function scopeProfessors($query)
    {
        return $query->where('role', 'professeur');
    }

    // ── Helpers ───────────────────────────────────────────────────
    public function isAdmin(): bool
    {
        return in_array($this->role, ['super_admin', 'admin']);
    }

    public function isStudent(): bool
    {
        return in_array($this->role, ['etudiant_concours', 'etudiant_externe']);
    }

    public function isProfessor(): bool
    {
        return $this->role === 'professeur';
    }

    public function isStaff(): bool
    {
        return $this->role === 'membre_administratif';
    }

    // ── Relations ─────────────────────────────────────────────────
    public function grades()
    {
        return $this->hasMany(Grade::class, 'student_id');
    }

    public function attendanceRecords()
    {
        return $this->hasMany(AttendanceRecord::class, 'student_id');
    }

    public function paymentRecords()
    {
        return $this->hasMany(PaymentRecord::class, 'student_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'user_id');
    }
}
