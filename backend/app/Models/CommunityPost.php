<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CommunityPost extends Model
{
    use HasFactory;

    protected $fillable = ['author_id', 'content'];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function likes()
    {
        return $this->belongsToMany(User::class, 'community_post_likes', 'post_id', 'user_id');
    }
}
