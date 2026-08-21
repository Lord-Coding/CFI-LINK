<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function __construct(private AuditService $audit) {}

    // GET /api/users
    public function index(Request $request)
    {
        if (! $request->user()->isAdmin() && ! $request->user()->isStaff()) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }
        $query = User::query();

        if ($request->has('role'))   $query->where('role', $request->role);
        if ($request->has('filiere')) $query->where('filiere', $request->filiere);
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('nom_complet', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $query->orderBy('nom_complet');
        $perPage = min((int) ($request->per_page ?? 50), 200);

        if ($request->boolean('all')) {
            return response()->json($query->get());
        }

        return response()->json($query->paginate($perPage));
    }

    // GET /api/users/{user}
    public function show(User $user)
    {
        return response()->json($user);
    }

    // POST /api/users
    public function store(Request $request)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }
        $data = $request->validate([
            'nom_complet' => 'required|string|max:255',
            'email'       => 'required|email|unique:users,email',
            'password'    => 'required|string|min:8',
            'role'        => ['required', Rule::in([
                'super_admin', 'admin', 'professeur',
                'membre_administratif', 'etudiant_concours', 'etudiant_externe',
            ])],
            'is_active'   => 'boolean',
            'filiere'     => ['nullable', Rule::in(['LIC', 'LAP'])],
            'annee'       => ['nullable', Rule::in(['L1', 'L2', 'L3'])],
            'option_lic'  => ['nullable', Rule::in(['GL', 'SR'])],
            'specialite'  => 'nullable|string|max:255',
            'grade'       => 'nullable|string|max:255',
            'service'     => 'nullable|string|max:255',
            'staff_role'  => ['nullable', Rule::in(['secretariat', 'comptable', 'responsable_scolarite'])],
        ]);

        $user = User::create($data);

        $this->audit->log($request->user(), 'Création utilisateur', "Compte {$user->nom_complet} ({$user->role}) créé", 'user');

        return response()->json($user, 201);
    }

    // PUT /api/users/{user}
    public function update(Request $request, User $user)
    {
        // Un utilisateur peut modifier son propre profil ; seul admin peut changer le rôle
        if (! $request->user()->isAdmin() && $request->user()->id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }
        // Empêcher l'escalade de rôle par un non-admin
        if ($request->has('role') && ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }
        $data = $request->validate([
            'nom_complet'     => 'sometimes|string|max:255',
            'email'           => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'password'        => 'sometimes|string|min:8',
            'role'            => ['sometimes', Rule::in([
                'super_admin', 'admin', 'professeur',
                'membre_administratif', 'etudiant_concours', 'etudiant_externe',
            ])],
            'is_active'       => 'sometimes|boolean',
            'payment_blocked' => 'sometimes|boolean',
            'filiere'         => ['sometimes', 'nullable', Rule::in(['LIC', 'LAP'])],
            'annee'           => ['sometimes', 'nullable', Rule::in(['L1', 'L2', 'L3'])],
            'option_lic'      => ['sometimes', 'nullable', Rule::in(['GL', 'SR'])],
            'specialite'      => 'sometimes|nullable|string|max:255',
            'grade'           => 'sometimes|nullable|string|max:255',
            'service'         => 'sometimes|nullable|string|max:255',
            'staff_role'      => ['sometimes', 'nullable', Rule::in(['secretariat', 'comptable', 'responsable_scolarite'])],
        ]);

        $user->update($data);

        $this->audit->log($request->user(), 'Modification utilisateur', "Compte {$user->nom_complet} modifié", 'user');

        return response()->json($user);
    }

    // DELETE /api/users/{user}
    public function destroy(Request $request, User $user)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Impossible de supprimer votre propre compte.'], 422);
        }

        $this->audit->log($request->user(), 'Suppression utilisateur', "Compte {$user->nom_complet} supprimé", 'user');
        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }

    // PATCH /api/users/{user}/toggle-active
    public function toggleActive(Request $request, User $user)
    {
        $user->update(['is_active' => ! $user->is_active]);
        $action = $user->is_active ? 'Activation' : 'Désactivation';
        $this->audit->log($request->user(), "{$action} compte", "{$action} du compte {$user->nom_complet}", 'user');

        return response()->json($user);
    }

    // PATCH /api/users/{user}/toggle-payment-block
    public function togglePaymentBlock(Request $request, User $user)
    {
        $user->update(['payment_blocked' => ! $user->payment_blocked]);
        $action = $user->payment_blocked ? 'Blocage paiement' : 'Déblocage paiement';
        $this->audit->log($request->user(), $action, "{$action} du compte {$user->nom_complet}", 'payment');

        return response()->json($user);
    }
}
