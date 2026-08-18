<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $notifs = Notification::where(fn($q) => $q
            ->where('user_id', $user->id)
            ->orWhere(fn($q2) => $q2
                ->whereNull('user_id')
                ->where(fn($q3) => $q3
                    ->where('target_role', 'all')
                    ->orWhere('target_role', $user->role)
                )
            )
        )->orderByDesc('created_at')->limit(50)->get();

        return response()->json($notifs);
    }

    public function markRead(Notification $notification)
    {
        $notification->update(['read' => true]);
        return response()->json($notification);
    }

    public function markAllRead(Request $request)
    {
        $user = $request->user();

        Notification::where(fn($q) => $q
            ->where('user_id', $user->id)
            ->orWhere(fn($q2) => $q2
                ->whereNull('user_id')
                ->where(fn($q3) => $q3
                    ->where('target_role', 'all')
                    ->orWhere('target_role', $user->role)
                )
            )
        )->update(['read' => true]);

        return response()->json(['message' => 'Toutes les notifications lues.']);
    }

    public function destroy(Notification $notification)
    {
        $notification->delete();
        return response()->json(['message' => 'Notification supprimée.']);
    }
}
