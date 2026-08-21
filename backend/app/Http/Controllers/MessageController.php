<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function inbox(Request $request)
    {
        $perPage = min((int) ($request->per_page ?? 25), 100);
        return response()->json(
            Message::with('sender:id,nom_complet')
                ->where('to_id', $request->user()->id)
                ->orderByDesc('created_at')
                ->paginate($perPage)
        );
    }

    public function sent(Request $request)
    {
        $perPage = min((int) ($request->per_page ?? 25), 100);
        return response()->json(
            Message::with('recipient:id,nom_complet')
                ->where('from_id', $request->user()->id)
                ->orderByDesc('created_at')
                ->paginate($perPage)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'to_id'   => 'required|exists:users,id',
            'subject' => 'required|string|max:255',
            'body'    => 'required|string',
        ]);

        $msg = Message::create([
            ...$data,
            'from_id' => $request->user()->id,
        ]);

        return response()->json($msg->load('sender:id,nom_complet', 'recipient:id,nom_complet'), 201);
    }

    public function markRead(Message $message)
    {
        $message->update(['read' => true]);
        return response()->json($message);
    }

    public function destroy(Message $message)
    {
        $message->delete();
        return response()->json(['message' => 'Message supprimé.']);
    }
}
