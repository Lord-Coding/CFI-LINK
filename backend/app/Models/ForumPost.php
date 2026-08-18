<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ForumPost extends Model
{
    use HasFactory;

    protected $fillable = ['course_id', 'author_id', 'title', 'content', 'pinned'];

    protected function casts(): array
    {
        return ['pinned' => 'boolean'];
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function replies()
    {
        return $this->hasMany(ForumReply::class, 'post_id')->whereNull('parent_id')->with('childReplies.author');
    }
}
