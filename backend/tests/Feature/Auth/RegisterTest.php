<?php

namespace Tests\Feature\Auth;

use App\Models\ConcoursCode;
use App\Models\User;
use App\Models\ValidationCode;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    #[Test]
    public function student_can_register_with_valid_concours_code(): void
    {
        $code = ConcoursCode::factory()->create([
            'nom_complet' => 'Marie Nkoulou',
            'filiere'     => 'LIC',
            'annee'       => 'L1',
        ]);

        $this->postJson('/api/register', [
            'type'     => 'concours',
            'code'     => $code->code,
            'email'    => 'marie@test.com',
            'password' => 'Secret@123',
        ])->assertCreated()
          ->assertJsonPath('user.email', 'marie@test.com')
          ->assertJsonPath('user.role', 'etudiant_concours');

        $this->assertDatabaseHas('concours_codes', ['code' => $code->code, 'used' => 1]);
    }

    #[Test]
    public function registration_fails_with_already_used_concours_code(): void
    {
        $student = User::factory()->student()->create();
        $code    = ConcoursCode::factory()->used($student)->create();

        $this->postJson('/api/register', [
            'type'     => 'concours',
            'code'     => $code->code,
            'email'    => 'new@test.com',
            'password' => 'Secret@123',
        ])->assertStatus(422);
    }

    #[Test]
    public function external_student_can_register_with_valid_validation_code(): void
    {
        $code = ValidationCode::factory()->create();

        $this->postJson('/api/register', [
            'type'        => 'externe',
            'code'        => $code->code,
            'email'       => 'ext@test.com',
            'password'    => 'Secret@123',
            'nom_complet' => 'Paul Biya',
            'filiere'     => 'LAP',
            'annee'       => 'L1',
        ])->assertCreated()
          ->assertJsonPath('user.role', 'etudiant_externe')
          ->assertJsonPath('user.is_active', false);
    }

    #[Test]
    public function registration_fails_with_expired_validation_code(): void
    {
        $code = ValidationCode::factory()->expired()->create();

        $this->postJson('/api/register', [
            'type'        => 'externe',
            'code'        => $code->code,
            'email'       => 'exp@test.com',
            'password'    => 'Secret@123',
            'nom_complet' => 'Jean Test',
            'filiere'     => 'LIC',
            'annee'       => 'L1',
        ])->assertStatus(422);
    }

    #[Test]
    public function registration_fails_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'taken@test.com']);
        $code = ConcoursCode::factory()->create();

        $this->postJson('/api/register', [
            'type'     => 'concours',
            'code'     => $code->code,
            'email'    => 'taken@test.com',
            'password' => 'Secret@123',
        ])->assertStatus(422)
          ->assertJsonValidationErrors(['email']);
    }
}
