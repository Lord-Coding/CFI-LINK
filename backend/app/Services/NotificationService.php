<?php

namespace App\Services;

use App\Models\Notification;

class NotificationService
{
    /**
     * Crée une notification ciblant un utilisateur précis (user_id)
     * ou tous les utilisateurs d'un rôle (target_role).
     */
    public function send(
        ?int   $userId     = null,
        string $type       = 'systeme',
        string $title      = '',
        string $message    = '',
        ?string $targetRole = null,
    ): Notification {
        return Notification::create([
            'user_id'     => $userId,
            'target_role' => $targetRole,
            'type'        => $type,
            'title'       => $title,
            'message'     => $message,
            'read'        => false,
        ]);
    }

    public function sendToRole(string $role, string $type, string $title, string $message): Notification
    {
        return $this->send(null, $type, $title, $message, $role);
    }
}
