<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class LoginTest extends TestCase
{
    #[Test]
    public function user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create(['password' => bcrypt('Secret@123')]);

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'Secret@123'])
             ->assertOk()
             ->assertJsonStructure(['user', 'token'])
             ->assertJsonPath('user.email', $user->email);
    }

    #[Test]
    public function login_fails_with_wrong_password(): void
    {
        $user = User::factory()->create(['password' => bcrypt('correct')]);

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'wrong'])
             ->assertStatus(401);
    }

    #[Test]
    public function login_fails_with_unknown_email(): void
    {
        $this->postJson('/api/login', ['email' => 'ghost@test.com', 'password' => 'anything'])
             ->assertStatus(401);
    }

    #[Test]
    public function inactive_account_is_rejected_with_403(): void
    {
        $user = User::factory()->inactive()->create(['password' => bcrypt('pass')]);

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'pass'])
             ->assertStatus(403);
    }

    #[Test]
    public function blocked_payment_account_returns_payment_blocked(): void
    {
        $user = User::factory()->blocked()->create(['password' => bcrypt('pass')]);

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'pass'])
             ->assertOk()
             ->assertJsonPath('message', 'PAYMENT_BLOCKED')
             ->assertJsonStructure(['token', 'user']);
    }

    #[Test]
    public function login_returns_token_that_authenticates_future_requests(): void
    {
        $user  = User::factory()->admin()->create(['password' => bcrypt('Admin@123')]);
        $token = $this->postJson('/api/login', ['email' => $user->email, 'password' => 'Admin@123'])
                      ->json('token');

        $this->getJson('/api/me', ['Authorization' => "Bearer {$token}"])
             ->assertOk()
             ->assertJsonPath('email', $user->email);
    }

    #[Test]
    public function login_requires_email_and_password(): void
    {
        $this->postJson('/api/login', [])
             ->assertStatus(422)
             ->assertJsonValidationErrors(['email', 'password']);
    }

    #[Test]
    public function user_can_logout(): void
    {
        $user  = User::factory()->create(['password' => bcrypt('pass')]);
        $token = $user->createToken('test')->plainTextToken;

        $this->postJson('/api/logout', [], ['Authorization' => "Bearer {$token}"])
             ->assertOk();

        // Vérifie que le token est bien supprimé de la DB
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $user->id]);
    }
}
