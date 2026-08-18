<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ForumReply extends Model
{
    protected $fillable = ['post_id', 'parent_id', 'author_id', 'content'];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function childReplies()
    {
        return $this->hasMany(ForumReply::class, 'parent_id')->with('author');
    }
}
