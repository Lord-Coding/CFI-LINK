<?php

namespace Tests\Feature\Business;

use App\Models\ConcoursCode;
use App\Models\User;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CodesTest extends TestCase
{
    #[Test]
    public function admin_can_generate_concours_code(): void
    {
        $response = $this->postJson('/api/codes/concours', [
            'nom_complet' => 'Éric Mvondo',
            'filiere'     => 'LIC',
            'annee'       => 'L2',
        ], $this->authHeaders('admin'));

        $response->assertCreated()
                 ->assertJsonStructure(['code', 'nom_complet', 'filiere', 'annee'])
                 ->assertJsonPath('nom_complet', 'Éric Mvondo');

        $this->assertStringStartsWith('CONC-', $response->json('code'));
    }

    #[Test]
    public function admin_can_generate_validation_code(): void
    {
        $response = $this->postJson('/api/codes/validation', ['expires_in_days' => 30], $this->authHeaders('admin'));

        $response->assertCreated()->assertJsonStructure(['code', 'expires_at']);
        $this->assertStringStartsWith('EXT-', $response->json('code'));
    }

    #[Test]
    public function admin_can_delete_unused_concours_code(): void
    {
        $code = ConcoursCode::factory()->create();

        $this->deleteJson("/api/codes/concours/{$code->id}", [], $this->authHeaders('admin'))
             ->assertOk();

        $this->assertDatabaseMissing('concours_codes', ['id' => $code->id]);
    }

    #[Test]
    public function admin_cannot_delete_used_concours_code(): void
    {
        $student = User::factory()->student()->create();
        $code    = ConcoursCode::factory()->used($student)->create();

        $this->deleteJson("/api/codes/concours/{$code->id}", [], $this->authHeaders('admin'))
             ->assertStatus(422);

        $this->assertDatabaseHas('concours_codes', ['id' => $code->id]);
    }

    #[Test]
    public function generated_concours_codes_are_unique(): void
    {
        $headers = $this->authHeaders('admin');
        $codes   = [];

        for ($i = 0; $i < 10; $i++) {
            $codes[] = $this->postJson('/api/codes/concours', [
                'nom_complet' => "Étudiant {$i}",
                'filiere'     => 'LIC',
                'annee'       => 'L1',
            ], $headers)->json('code');
        }

        $this->assertCount(10, array_unique($codes), 'Tous les codes doivent être uniques');
    }
}
