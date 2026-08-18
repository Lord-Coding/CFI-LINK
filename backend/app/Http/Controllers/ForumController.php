<?php

namespace App\Http\Controllers;

use App\Models\ForumPost;
use App\Models\ForumReply;
use Illuminate\Http\Request;

class ForumController extends Controller
{
    public function index(Request $request)
    {
        $courseId = $request->get('course_id', 'general');

        return response()->json(
            ForumPost::with(['author:id,nom_complet', 'replies.author'])
                ->where('course_id', $courseId)
                ->orderByDesc('pinned')
                ->orderByDesc('created_at')
                ->paginate(20)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'     => 'required|string|max:255',
            'content'   => 'required|string',
            'course_id' => 'nullable|string',
        ]);

        $post = ForumPost::create([
            ...$data,
            'course_id' => $data['course_id'] ?? 'general',
            'author_id' => $request->user()->id,
        ]);

        return response()->json($post->load('author:id,nom_complet'), 201);
    }

    public function reply(Request $request, ForumPost $forumPost)
    {
        $data = $request->validate([
            'content'   => 'required|string',
            'parent_id' => 'nullable|exists:forum_replies,id',
        ]);

        $reply = ForumReply::create([
            'post_id'   => $forumPost->id,
            'parent_id' => $data['parent_id'] ?? null,
            'author_id' => $request->user()->id,
            'content'   => $data['content'],
        ]);

        return response()->json($reply->load('author:id,nom_complet'), 201);
    }

    public function togglePin(Request $request, ForumPost $forumPost)
    {
        $forumPost->update(['pinned' => ! $forumPost->pinned]);
        return response()->json($forumPost);
    }

    public function destroy(Request $request, ForumPost $forumPost)
    {
        if ($forumPost->author_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        $forumPost->delete();
        return response()->json(['message' => 'Post supprimé.']);
    }
}
