<?php

namespace App\Http\Controllers;

use App\Models\DocumentRequest;
use App\Services\AuditService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DocumentRequestController extends Controller
{
    public function __construct(
        private AuditService $audit,
        private NotificationService $notifService,
    ) {}

    public function index(Request $request)
    {
        $user  = $request->user();
        $query = DocumentRequest::with('student:id,nom_complet,filiere,annee');

        if ($user->isStudent()) {
            $query->where('student_id', $user->id);
        }

        return response()->json($query->orderByDesc('requested_at')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => ['required', Rule::in([
                'attestation_inscription', 'releve_notes',
                'certificat_scolarite', 'attestation_reussite',
            ])],
        ]);

        $req = DocumentRequest::create([
            ...$data,
            'student_id'   => $request->user()->id,
            'status'       => 'pending',
            'requested_at' => now(),
        ]);

        $this->audit->log($request->user(), 'Demande document', "Demande de {$data['type']} créée", 'document');

        return response()->json($req, 201);
    }

    public function process(Request $request, DocumentRequest $documentRequest)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['approved', 'rejected', 'ready'])],
            'notes'  => 'nullable|string|max:500',
        ]);

        $documentRequest->update([
            ...$data,
            'processed_at' => now(),
            'processed_by' => $request->user()->id,
        ]);

        $statusLabels = ['approved' => 'approuvée', 'rejected' => 'rejetée', 'ready' => 'prête'];
        $label = $statusLabels[$data['status']] ?? $data['status'];

        $this->notifService->send(
            userId: $documentRequest->student_id,
            type:    'systeme',
            title:   'Demande de document mise à jour',
            message: "Votre demande de document a été {$label}." . ($data['notes'] ? " Note : {$data['notes']}" : ''),
        );

        $this->audit->log($request->user(), 'Traitement document', "Demande #{$documentRequest->id} : {$label}", 'document');

        return response()->json($documentRequest);
    }
}
