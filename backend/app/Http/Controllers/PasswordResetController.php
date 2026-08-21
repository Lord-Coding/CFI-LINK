<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\AuditService;
use App\Services\ResendMailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PasswordResetController extends Controller
{
    public function __construct(
        private ResendMailService $mailer,
        private AuditService      $audit,
    ) {}

    // ─────────────────────────────────────────────────────────────
    // ÉTAPE 1 — L'utilisateur soumet son email
    // POST /api/password/forgot
    // ─────────────────────────────────────────────────────────────
    public function requestReset(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $data['email'])->first();

        // Réponse identique que l'utilisateur existe ou non (sécurité anti-énumération)
        if (! $user) {
            return response()->json([
                'message' => 'Si cet email existe, un code a été envoyé.',
            ]);
        }

        // Supprimer les anciens codes non utilisés pour cet email
        DB::table('password_reset_codes')
            ->where('email', $data['email'])
            ->delete();

        // Générer un code à 6 chiffres
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        DB::table('password_reset_codes')->insert([
            'email'      => $data['email'],
            'code'       => $code,
            'used'       => false,
            'expires_at' => now()->addMinutes(15),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Envoyer le mail via Resend
        $sent = $this->mailer->sendPasswordReset($user->email, $user->nom_complet, $code);

        if (! $sent) {
            return response()->json(['message' => "Erreur lors de l'envoi du mail. Réessayez."], 500);
        }

        $this->audit->log($user, 'Demande réinitialisation MDP', "Code envoyé à {$user->email}", 'auth');

        return response()->json(['message' => 'Si cet email existe, un code a été envoyé.']);
    }

    // ─────────────────────────────────────────────────────────────
    // ÉTAPE 2 — L'utilisateur vérifie son code (optionnel, peut
    //           être combiné avec l'étape 3)
    // POST /api/password/verify
    // ─────────────────────────────────────────────────────────────
    public function verifyCode(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'code'  => 'required|string|size:6',
        ]);

        $record = DB::table('password_reset_codes')
            ->where('email', $data['email'])
            ->where('code',  $data['code'])
            ->where('used',  false)
            ->where('expires_at', '>', now())
            ->first();

        if (! $record) {
            return response()->json(['valid' => false, 'message' => 'Code invalide ou expiré.'], 422);
        }

        return response()->json(['valid' => true, 'message' => 'Code valide.']);
    }

    // ─────────────────────────────────────────────────────────────
    // ÉTAPE 3 — L'utilisateur soumet le nouveau mot de passe
    // POST /api/password/reset
    // ─────────────────────────────────────────────────────────────
    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'email'                 => 'required|email',
            'code'                  => 'required|string|size:6',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string',
        ]);

        $record = DB::table('password_reset_codes')
            ->where('email', $data['email'])
            ->where('code',  $data['code'])
            ->where('used',  false)
            ->where('expires_at', '>', now())
            ->first();

        if (! $record) {
            return response()->json(['message' => 'Code invalide ou expiré.'], 422);
        }

        $user = User::where('email', $data['email'])->first();

        if (! $user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        // Mettre à jour le mot de passe
        $user->update(['password' => Hash::make($data['password'])]);

        // Marquer le code comme utilisé
        DB::table('password_reset_codes')
            ->where('email', $data['email'])
            ->update(['used' => true, 'updated_at' => now()]);

        // Révoquer tous les tokens actifs pour forcer une reconnexion
        $user->tokens()->delete();

        $this->audit->log($user, 'Réinitialisation MDP', 'Mot de passe réinitialisé avec succès', 'auth');

        return response()->json(['message' => 'Mot de passe mis à jour. Vous pouvez vous connecter.']);
    }
}
