<?php

namespace Tests\Feature\Security;

use App\Models\Course;
use App\Models\Grade;
use App\Models\PaymentRecord;
use App\Models\User;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AuthorizationSecurityTest extends TestCase
{
    #[Test]
    public function student_cannot_read_another_students_grades(): void
    {
        $ctx1   = $this->actingAsRole('etudiant_concours');
        $stud2  = User::factory()->student()->create();
        $course = Course::factory()->create();
        $prof   = User::factory()->professor()->create();

        Grade::factory()->published()->create([
            'student_id' => $stud2->id,
            'course_id'  => $course->id,
            'created_by' => $prof->id,
        ]);

        $grades = $this->getJson('/api/grades', $ctx1['headers'])->assertOk()->json();

        $this->assertEmpty(
            array_filter($grades, fn($g) => $g['student_id'] === $stud2->id)
        );
    }

    #[Test]
    public function student_cannot_read_another_students_payments(): void
    {
        $ctx1  = $this->actingAsRole('etudiant_concours');
        $stud2 = User::factory()->student()->create();

        PaymentRecord::factory()->count(3)->create(['student_id' => $stud2->id]);

        $payments = $this->getJson('/api/payments', $ctx1['headers'])->assertOk()->json();

        $this->assertEmpty(
            array_filter($payments, fn($p) => $p['student_id'] === $stud2->id)
        );
    }

    #[Test]
    public function student_cannot_delete_another_user(): void
    {
        $ctx  = $this->actingAsRole('etudiant_concours');
        $user = User::factory()->create();

        $this->deleteJson("/api/users/{$user->id}", [], $ctx['headers'])->assertForbidden();
        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    #[Test]
    public function student_cannot_promote_themselves_to_admin(): void
    {
        $ctx = $this->actingAsRole('etudiant_concours');

        $this->putJson("/api/users/{$ctx['user']->id}", ['role' => 'super_admin'], $ctx['headers'])
             ->assertForbidden();

        $ctx['user']->refresh();
        $this->assertNotEquals('super_admin', $ctx['user']->role);
    }

    #[Test]
    public function using_deleted_token_returns_401(): void
    {
        $user  = User::factory()->create();
        $token = $user->createToken('session')->plainTextToken;
        $user->tokens()->delete();

        $this->getJson('/api/me', [
            'Authorization' => "Bearer {$token}",
            'Accept'        => 'application/json',
        ])->assertUnauthorized();
    }

    #[Test]
    public function forged_token_returns_401(): void
    {
        $this->getJson('/api/me', [
            'Authorization' => 'Bearer this.is.a.fake.token',
            'Accept'        => 'application/json',
        ])->assertUnauthorized();
    }
}
