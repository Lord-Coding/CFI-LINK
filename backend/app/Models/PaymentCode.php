<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PaymentCode extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'student_id', 'month', 'used'];

    protected function casts(): array
    {
        return ['used' => 'boolean'];
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public static function generateCode(): string
    {
        do {
            $code = 'PAY-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
        } while (self::where('code', $code)->exists());

        return $code;
    }
}
