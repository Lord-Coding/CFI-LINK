<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels — CFI-LINK
|--------------------------------------------------------------------------
|
| Canal privé par utilisateur  →  private-notifications.{userId}
|   Autorisé si l'utilisateur connecté est le propriétaire du canal.
|
| Canal privé par rôle         →  private-role.{role}
|   Autorisé si l'utilisateur connecté a ce rôle (ou est admin).
|
*/

// Canal personnel : chaque utilisateur écoute SES notifications
Broadcast::channel('notifications.{userId}', function (User $user, int $userId) {
    return (int) $user->id === $userId;
});

// Canal de rôle : les admins écoutent toutes les notifs admin,
// les profs écoutent les notifs prof, etc.
Broadcast::channel('role.{role}', function (User $user, string $role) {
    // Super admin peut écouter tous les canaux de rôle
    if ($user->role === 'super_admin') {
        return true;
    }

    return $user->role === $role;
});
