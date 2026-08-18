<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ValidationCode extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'used', 'used_by', 'expires_at'];

    protected function casts(): array
    {
        return [
            'used'       => 'boolean',
            'expires_at' => 'datetime',
        ];
    }

    public function usedByUser()
    {
        return $this->belongsTo(User::class, 'used_by');
    }

    public static function generateCode(): string
    {
        do {
            $code = 'EXT-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
        } while (self::where('code', $code)->exists());

        return $code;
    }
}
