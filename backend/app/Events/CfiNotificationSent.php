<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Événement broadcasté en temps réel dès qu'une notification
 * est créée (notes publiées, paiement confirmé, absence, etc.).
 *
 * Implémente ShouldBroadcastNow pour envoyer immédiatement
 * sans passer par la queue (les notifications sont urgentes).
 */
class CfiNotificationSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Notification $notification
    ) {}

    /**
     * Canal privé par utilisateur  →  private-notifications.{userId}
     * Canal de rôle               →  private-role.{role}  (ex: admin)
     */
    public function broadcastOn(): array
    {
        $channels = [];

        if ($this->notification->user_id) {
            $channels[] = new PrivateChannel("notifications.{$this->notification->user_id}");
        }

        if ($this->notification->target_role) {
            $channels[] = new PrivateChannel("role.{$this->notification->target_role}");
        }

        return $channels;
    }

    /**
     * Nom de l'événement côté client Echo.
     */
    public function broadcastAs(): string
    {
        return 'notification.new';
    }

    /**
     * Payload envoyé au client.
     */
    public function broadcastWith(): array
    {
        return [
            'id'          => $this->notification->id,
            'type'        => $this->notification->type,
            'title'       => $this->notification->title,
            'message'     => $this->notification->message,
            'read'        => $this->notification->read,
            'created_at'  => $this->notification->created_at?->toISOString(),
        ];
    }
}
