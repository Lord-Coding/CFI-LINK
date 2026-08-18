<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ConcoursCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', 'nom_complet', 'filiere', 'annee', 'option_lic', 'used', 'used_by',
    ];

    protected function casts(): array
    {
        return ['used' => 'boolean'];
    }

    public function usedByUser()
    {
        return $this->belongsTo(User::class, 'used_by');
    }

    public static function generateCode(): string
    {
        do {
            $code = 'CONC-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
        } while (self::where('code', $code)->exists());

        return $code;
    }
}
