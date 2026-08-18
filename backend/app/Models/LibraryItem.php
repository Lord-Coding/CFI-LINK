<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LibraryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'author', 'category', 'filiere', 'description',
        'file_type', 'size', 'file_url', 'downloads', 'added_by',
    ];

    public function addedBy()
    {
        return $this->belongsTo(User::class, 'added_by');
    }
}
