<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ConcoursCode;
use App\Models\ValidationCode;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function __construct(private AuditService $audit) {}

    // POST /api/login
    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Email ou mot de passe incorrect.'], 401);
        }

        if (! $user->is_active) {
            return response()->json(['message' => "Votre compte n'est pas encore activé. Contactez l'administration."], 403);
        }

        if ($user->payment_blocked) {
            $token = $user->createToken('cfi-mobile')->plainTextToken;
            $this->audit->log($user, 'Connexion', 'Connexion avec compte bloqué (impayé)', 'auth');
            return response()->json([
                'message' => 'PAYMENT_BLOCKED',
                'user'    => $user,
                'token'   => $token,
            ], 200);
        }

        $token = $user->createToken('cfi-mobile')->plainTextToken;
        $this->audit->log($user, 'Connexion', 'Connexion réussie', 'auth');

        return response()->json(['user' => $user, 'token' => $token]);
    }

    // POST /api/logout
    public function logout(Request $request)
    {
        $this->audit->log($request->user(), 'Déconnexion', 'Déconnexion', 'auth');
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté.']);
    }

    // GET /api/me
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    // POST /api/register
    public function register(Request $request)
    {
        $data = $request->validate([
            'type'     => ['required', Rule::in(['concours', 'externe'])],
            'code'     => 'required|string',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            // Champs externes uniquement
            'nom_complet' => 'required_if:type,externe|nullable|string|max:255',
            'filiere'     => ['required_if:type,externe', 'nullable', Rule::in(['LIC', 'LAP'])],
            'annee'       => ['required_if:type,externe', 'nullable', Rule::in(['L1', 'L2', 'L3'])],
            'option_lic'  => ['nullable', Rule::in(['GL', 'SR'])],
        ]);

        if ($data['type'] === 'concours') {
            $code = ConcoursCode::where('code', $data['code'])->where('used', false)->first();
            if (! $code) {
                return response()->json(['message' => 'Code concours invalide ou déjà utilisé.'], 422);
            }

            $user = User::create([
                'nom_complet' => $code->nom_complet,
                'email'       => $data['email'],
                'password'    => $data['password'],
                'role'        => 'etudiant_concours',
                'is_active'   => true,
                'filiere'     => $code->filiere,
                'annee'       => $code->annee,
                'option_lic'  => $code->option_lic,
            ]);

            $code->update(['used' => true, 'used_by' => $user->id]);
        } else {
            $code = ValidationCode::where('code', $data['code'])->where('used', false)
                ->where('expires_at', '>', now())->first();
            if (! $code) {
                return response()->json(['message' => 'Code de validation invalide ou expiré.'], 422);
            }

            $user = User::create([
                'nom_complet' => $data['nom_complet'],
                'email'       => $data['email'],
                'password'    => $data['password'],
                'role'        => 'etudiant_externe',
                'is_active'   => false,
                'filiere'     => $data['filiere'],
                'annee'       => $data['annee'],
                'option_lic'  => $data['option_lic'] ?? null,
            ]);

            $code->update(['used' => true, 'used_by' => $user->id]);
        }

        $this->audit->log($user, 'Inscription', "Nouveau compte créé ({$data['type']})", 'user');

        return response()->json(['user' => $user, 'message' => 'Compte créé avec succès.'], 201);
    }
}
