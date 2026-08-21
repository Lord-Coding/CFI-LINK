<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Http::fake(['https://api.resend.com/*' => Http::response(['id' => 'fake'], 200)]);
    }

    private function insertCode(string $email, string $code, bool $expired = false): void
    {
        DB::table('password_reset_codes')->insert([
            'email'      => $email,
            'code'       => $code,
            'used'       => false,
            'expires_at' => $expired ? now()->subMinutes(5) : now()->addMinutes(15),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    #[Test]
    public function forgot_password_returns_neutral_message(): void
    {
        User::factory()->create(['email' => 'reset@test.com']);

        $this->postJson('/api/password/forgot', ['email' => 'reset@test.com'])
             ->assertOk()
             ->assertJsonPath('message', 'Si cet email existe, un code a été envoyé.');

        $this->assertDatabaseHas('password_reset_codes', ['email' => 'reset@test.com', 'used' => 0]);
    }

    #[Test]
    public function forgot_password_returns_same_message_for_unknown_email(): void
    {
        $real  = $this->postJson('/api/password/forgot', ['email' => 'ghost@nowhere.com']);
        User::factory()->create(['email' => 'real@test.com']);
        $other = $this->postJson('/api/password/forgot', ['email' => 'real@test.com']);

        $this->assertEquals($real->json('message'), $other->json('message'));
        $this->assertEquals($real->getStatusCode(), $other->getStatusCode());
    }

    #[Test]
    public function valid_code_passes_verification(): void
    {
        User::factory()->create(['email' => 'verify@test.com']);
        $this->insertCode('verify@test.com', '654321');

        $this->postJson('/api/password/verify', ['email' => 'verify@test.com', 'code' => '654321'])
             ->assertOk()
             ->assertJsonPath('valid', true);
    }

    #[Test]
    public function expired_code_fails_verification(): void
    {
        User::factory()->create(['email' => 'exp@test.com']);
        $this->insertCode('exp@test.com', '111111', expired: true);

        $this->postJson('/api/password/verify', ['email' => 'exp@test.com', 'code' => '111111'])
             ->assertStatus(422)
             ->assertJsonPath('valid', false);
    }

    #[Test]
    public function user_can_reset_password_with_valid_code(): void
    {
        $user = User::factory()->create(['email' => 'new@test.com', 'password' => bcrypt('OldPass@123')]);
        $this->insertCode('new@test.com', '999888');

        $this->postJson('/api/password/reset', [
            'email'                 => 'new@test.com',
            'code'                  => '999888',
            'password'              => 'NewPass@456',
            'password_confirmation' => 'NewPass@456',
        ])->assertOk();

        $this->assertDatabaseHas('password_reset_codes', ['email' => 'new@test.com', 'used' => 1]);

        // Vérifier qu'on peut se connecter avec le nouveau mot de passe
        $this->postJson('/api/login', ['email' => 'new@test.com', 'password' => 'NewPass@456'])
             ->assertOk();
    }

    #[Test]
    public function reset_fails_when_passwords_dont_match(): void
    {
        User::factory()->create(['email' => 'mismatch@test.com']);
        $this->insertCode('mismatch@test.com', '123456');

        $this->postJson('/api/password/reset', [
            'email'                 => 'mismatch@test.com',
            'code'                  => '123456',
            'password'              => 'NewPass@1',
            'password_confirmation' => 'DifferentPass@2',
        ])->assertStatus(422);
    }

    #[Test]
    public function reset_revokes_all_sanctum_tokens(): void
    {
        $user  = User::factory()->create(['email' => 'revoke@test.com', 'password' => bcrypt('old')]);
        $token = $user->createToken('old-session')->plainTextToken;
        $this->insertCode('revoke@test.com', '777777');

        $this->postJson('/api/password/reset', [
            'email'                 => 'revoke@test.com',
            'code'                  => '777777',
            'password'              => 'NewSecure@99',
            'password_confirmation' => 'NewSecure@99',
        ])->assertOk();

        // Vérifie que tous les tokens de l'utilisateur sont révoqués en DB
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $user->id]);
    }
}
