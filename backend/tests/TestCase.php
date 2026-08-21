<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    /**
     * Crée et authentifie un utilisateur avec le rôle donné.
     * Retourne le token Sanctum pour les appels API.
     */
    protected function actingAsRole(
        string $role,
        array  $overrides = []
    ): array {
        $user  = \App\Models\User::factory()->create(array_merge(['role' => $role], $overrides));
        $token = $user->createToken('test')->plainTextToken;

        return ['user' => $user, 'token' => $token, 'headers' => [
            'Authorization' => "Bearer {$token}",
            'Accept'        => 'application/json',
        ]];
    }

    /** Shortcut : retourne uniquement les headers d'auth. */
    protected function authHeaders(string $role, array $overrides = []): array
    {
        return $this->actingAsRole($role, $overrides)['headers'];
    }
}

