<?php

namespace App\Services;

use App\Events\CfiNotificationSent;
use App\Models\Notification;

class NotificationService
{
    /**
     * Crée une notification en base de données ET la broadcaste
     * en temps réel via Laravel Reverb (WebSocket).
     *
     * @param  int|null  $userId     ID de l'utilisateur ciblé (null = par rôle)
     * @param  string    $type       Type : annonce | note | paiement | systeme | cours
     * @param  string    $title      Titre affiché dans l'app
     * @param  string    $message    Corps du message
     * @param  string|null $targetRole  Rôle ciblé (all, admin, professeur…) — si $userId est null
     */
    public function send(
        ?int    $userId     = null,
        string  $type       = 'systeme',
        string  $title      = '',
        string  $message    = '',
        ?string $targetRole = null,
    ): Notification {
        // 1. Persister en base
        $notification = Notification::create([
            'user_id'     => $userId,
            'target_role' => $targetRole,
            'type'        => $type,
            'title'       => $title,
            'message'     => $message,
            'read'        => false,
        ]);

        // 2. Broadcaster via Reverb (instantané, sans queue)
        try {
            broadcast(new CfiNotificationSent($notification));
        } catch (\Throwable $e) {
            // Si Reverb n'est pas démarré (dev sans WS), on log sans planter l'app
            logger()->warning('Broadcasting failed (Reverb not running?): ' . $e->getMessage());
        }

        return $notification;
    }

    /**
     * Raccourci pour notifier tous les membres d'un rôle.
     */
    public function sendToRole(
        string $role,
        string $type,
        string $title,
        string $message,
    ): Notification {
        return $this->send(null, $type, $title, $message, $role);
    }
}
