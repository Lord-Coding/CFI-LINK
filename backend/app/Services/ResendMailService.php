<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ResendMailService
{
    private string $apiKey;
    private string $fromAddress;
    private string $fromName;

    public function __construct()
    {
        $this->apiKey      = config('services.resend.key', '');
        $this->fromAddress = config('mail.from.address', 'noreply@cfi-ciras.org');
        $this->fromName    = config('mail.from.name', 'CFI-LINK');
    }

    /**
     * Envoie un email via l'API Resend.
     *
     * @param  string  $to       Adresse destinataire
     * @param  string  $subject  Sujet
     * @param  string  $html     Corps HTML
     * @return bool
     */
    public function send(string $to, string $subject, string $html): bool
    {
        $response = Http::withToken($this->apiKey)
            ->post('https://api.resend.com/emails', [
                'from'    => "{$this->fromName} <{$this->fromAddress}>",
                'to'      => [$to],
                'subject' => $subject,
                'html'    => $html,
            ]);

        if (! $response->successful()) {
            Log::error('Resend API error', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            return false;
        }

        return true;
    }

    /**
     * Email de réinitialisation de mot de passe avec code 6 caractères.
     */
    public function sendPasswordReset(string $to, string $nom, string $code): bool
    {
        $subject = 'Réinitialisation de votre mot de passe — CFI-LINK';

        $html = <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Réinitialisation du mot de passe</title>
</head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
        style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a56db 0%,#0e40a9 100%);padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">CFI-LINK</h1>
            <p style="margin:6px 0 0;color:#c7d9ff;font-size:13px;">Plateforme académique du CFI-CIRAS</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 16px;font-size:16px;color:#1e293b;">Bonjour <strong>{$nom}</strong>,</p>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
              Vous avez demandé à réinitialiser votre mot de passe.<br>
              Entrez le code ci-dessous dans l'application. Il est valable <strong>15 minutes</strong>.
            </p>

            <!-- Code box -->
            <div style="background:#f0f4ff;border:2px dashed #1a56db;border-radius:10px;
                        padding:24px 0;text-align:center;margin:0 0 28px;">
              <span style="font-size:42px;font-weight:800;letter-spacing:12px;color:#1a56db;
                           font-family:'Courier New',monospace;">{$code}</span>
            </div>

            <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">
              Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
              Votre mot de passe restera inchangé.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              © 2025 CFI-CIRAS — Tous droits réservés<br>
              Cet email a été envoyé automatiquement, ne pas répondre.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;

        return $this->send($to, $subject, $html);
    }
}
