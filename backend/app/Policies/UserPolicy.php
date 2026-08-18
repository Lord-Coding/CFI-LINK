<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $authUser): bool
    {
        return $authUser->isAdmin() || $authUser->isStaff();
    }

    public function view(User $authUser, User $user): bool
    {
        // Chacun peut voir son propre profil, les admins voient tout
        return $authUser->id === $user->id || $authUser->isAdmin();
    }

    public function create(User $authUser): bool
    {
        return $authUser->isAdmin();
    }

    public function update(User $authUser, User $user): bool
    {
        // Chacun peut modifier son propre profil (hors rôle) ; admin peut tout
        return $authUser->id === $user->id || $authUser->isAdmin();
    }

    public function delete(User $authUser, User $user): bool
    {
        return $authUser->isAdmin() && $authUser->id !== $user->id;
    }

    public function toggleActive(User $authUser): bool
    {
        return $authUser->isAdmin();
    }

    public function togglePaymentBlock(User $authUser): bool
    {
        return $authUser->isAdmin()
            || ($authUser->isStaff() && $authUser->staff_role === 'comptable');
    }
}
