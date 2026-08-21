<?php

namespace App\Http\Controllers;

use App\Models\ConcoursCode;
use App\Models\ValidationCode;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CodesController extends Controller
{
    public function __construct(private AuditService $audit) {}

    // ══════════════════════════════════════════
    //  CONCOURS CODES
    // ══════════════════════════════════════════

    // GET /api/codes/concours
    public function indexConcours(Request $request)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }
        return response()->json(ConcoursCode::with('usedByUser:id,nom_complet')->latest()->get());
    }

    // POST /api/codes/concours
    public function storeConcours(Request $request)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }
        $data = $request->validate([
            'nom_complet' => 'required|string|max:255',
            'filiere'     => ['required', Rule::in(['LIC', 'LAP'])],
            'annee'       => ['required', Rule::in(['L1', 'L2', 'L3'])],
            'option_lic'  => ['nullable', Rule::in(['GL', 'SR'])],
        ]);

        $code = ConcoursCode::create([
            ...$data,
            'code' => ConcoursCode::generateCode(),
        ]);

        $this->audit->log(
            $request->user(),
            'Création code concours',
            "Code {$code->code} créé pour {$code->nom_complet}",
            'code'
        );

        return response()->json($code, 201);
    }

    // DELETE /api/codes/concours/{id}
    public function destroyConcours(Request $request, ConcoursCode $concoursCode)
    {
        if ($concoursCode->used) {
            return response()->json(['message' => 'Impossible de supprimer un code déjà utilisé.'], 422);
        }

        $this->audit->log($request->user(), 'Suppression code concours', "Code {$concoursCode->code} supprimé", 'code');
        $concoursCode->delete();

        return response()->json(['message' => 'Code supprimé.']);
    }

    // ══════════════════════════════════════════
    //  VALIDATION CODES (externes)
    // ══════════════════════════════════════════

    // GET /api/codes/validation
    public function indexValidation(Request $request)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }
        return response()->json(ValidationCode::with('usedByUser:id,nom_complet')->latest()->get());
    }

    // POST /api/codes/validation
    public function storeValidation(Request $request)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }
        $data = $request->validate([
            'expires_in_days' => 'nullable|integer|min:1|max:365',
        ]);

        $days = $data['expires_in_days'] ?? 30;
        $code = ValidationCode::create([
            'code'       => ValidationCode::generateCode(),
            'expires_at' => now()->addDays($days),
        ]);

        $this->audit->log($request->user(), 'Création code validation', "Code {$code->code} créé (expire dans {$days}j)", 'code');

        return response()->json($code, 201);
    }

    // DELETE /api/codes/validation/{id}
    public function destroyValidation(Request $request, ValidationCode $validationCode)
    {
        if ($validationCode->used) {
            return response()->json(['message' => 'Impossible de supprimer un code déjà utilisé.'], 422);
        }

        $this->audit->log($request->user(), 'Suppression code validation', "Code {$validationCode->code} supprimé", 'code');
        $validationCode->delete();

        return response()->json(['message' => 'Code supprimé.']);
    }
}
