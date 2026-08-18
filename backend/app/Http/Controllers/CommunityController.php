<?php

namespace App\Http\Controllers;

use App\Models\CommunityPost;
use Illuminate\Http\Request;

class CommunityController extends Controller
{
    public function index()
    {
        return response()->json(
            CommunityPost::with('author:id,nom_complet')
                ->withCount('likes')
                ->orderByDesc('created_at')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate(['content' => 'required|string|max:1000']);

        $post = CommunityPost::create([
            'author_id' => $request->user()->id,
            'content'   => $data['content'],
        ]);

        return response()->json($post->load('author:id,nom_complet'), 201);
    }

    public function toggleLike(Request $request, CommunityPost $communityPost)
    {
        $communityPost->likes()->toggle($request->user()->id);
        return response()->json(['likes' => $communityPost->likes()->count()]);
    }

    public function destroy(Request $request, CommunityPost $communityPost)
    {
        if ($communityPost->author_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        $communityPost->delete();
        return response()->json(['message' => 'Post supprimé.']);
    }
}
