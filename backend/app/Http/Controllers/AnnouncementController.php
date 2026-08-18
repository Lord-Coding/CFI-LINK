<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Services\AuditService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AnnouncementController extends Controller
{
    public function __construct(
        private AuditService $audit,
        private NotificationService $notifService,
    ) {}

    public function index(Request $request)
    {
        $user  = $request->user();
        $query = Announcement::with('author:id,nom_complet')
            ->where(fn($q) => $q
                ->whereNull('target_role')
                ->orWhere('target_role', 'all')
                ->orWhere('target_role', $user->role)
            );

        if (! $user->isAdmin()) {
            $query->latest();
        } else {
            $query->orderByDesc('pinned')->latest();
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'content'     => 'required|string',
            'priority'    => ['required', Rule::in(['normal', 'important', 'urgent'])],
            'target_role' => 'nullable|string',
            'pinned'      => 'boolean',
        ]);

        $announcement = Announcement::create([
            ...$data,
            'author_id' => $request->user()->id,
        ]);

        // Notifier le rôle ciblé
        $this->notifService->sendToRole(
            $data['target_role'] ?? 'all',
            'annonce',
            $announcement->title,
            substr(strip_tags($announcement->content), 0, 120),
        );

        $this->audit->log($request->user(), 'Création annonce', "Annonce \"{$announcement->title}\" créée", 'system');

        return response()->json($announcement, 201);
    }

    public function update(Request $request, Announcement $announcement)
    {
        $data = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'content'     => 'sometimes|string',
            'priority'    => ['sometimes', Rule::in(['normal', 'important', 'urgent'])],
            'target_role' => 'sometimes|nullable|string',
            'pinned'      => 'sometimes|boolean',
        ]);

        $announcement->update($data);
        return response()->json($announcement);
    }

    public function destroy(Request $request, Announcement $announcement)
    {
        $this->audit->log($request->user(), 'Suppression annonce', "Annonce \"{$announcement->title}\" supprimée", 'system');
        $announcement->delete();
        return response()->json(['message' => 'Annonce supprimée.']);
    }
}
