<?php

namespace Tests\Feature\Authorization;

use App\Models\Course;
use App\Models\Grade;
use App\Models\User;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class RoleAuthorizationTest extends TestCase
{
    #[Test]
    public function unauthenticated_request_returns_401(): void
    {
        $endpoints = [
            ['GET',  '/api/me'],
            ['GET',  '/api/users'],
            ['GET',  '/api/grades'],
            ['GET',  '/api/payments'],
            ['GET',  '/api/courses'],
            ['GET',  '/api/audit-logs'],
            ['GET',  '/api/notifications'],
        ];

        foreach ($endpoints as [$method, $url]) {
            $response = $this->json($method, $url);
            $this->assertEquals(401, $response->getStatusCode(), "Expected 401 on {$method} {$url}");
        }
    }

    #[Test]
    public function student_cannot_list_all_users(): void
    {
        $this->getJson('/api/users', $this->authHeaders('etudiant_concours'))->assertForbidden();
    }

    #[Test]
    public function student_cannot_access_audit_logs(): void
    {
        $this->getJson('/api/audit-logs', $this->authHeaders('etudiant_concours'))->assertForbidden();
    }

    #[Test]
    public function student_cannot_create_user(): void
    {
        $this->postJson('/api/users', [
            'nom_complet' => 'Test',
            'email'       => 'create@test.com',
            'password'    => 'Secret@123',
            'role'        => 'admin',
        ], $this->authHeaders('etudiant_concours'))->assertForbidden();
    }

    #[Test]
    public function professor_cannot_access_admin_user_list(): void
    {
        $this->getJson('/api/users', $this->authHeaders('professeur'))->assertForbidden();
    }

    #[Test]
    public function admin_can_list_users(): void
    {
        User::factory()->count(3)->create();
        $this->getJson('/api/users', $this->authHeaders('admin'))->assertOk();
    }

    #[Test]
    public function admin_can_access_audit_logs(): void
    {
        $this->getJson('/api/audit-logs', $this->authHeaders('admin'))->assertOk();
    }

    #[Test]
    public function student_sees_only_own_published_grades(): void
    {
        $ctx    = $this->actingAsRole('etudiant_concours');
        $course = Course::factory()->create();
        $prof   = User::factory()->professor()->create();
        $other  = User::factory()->student()->create();

        // Note publiée de l'étudiant connecté
        Grade::factory()->published()->create([
            'student_id' => $ctx['user']->id,
            'course_id'  => $course->id,
            'created_by' => $prof->id,
        ]);

        // Note d'un autre cours pour cet étudiant (brouillon)
        $course2 = Course::factory()->create();
        Grade::factory()->create([
            'student_id' => $ctx['user']->id,
            'course_id'  => $course2->id,
            'created_by' => $prof->id,
            'status'     => 'draft',
        ]);

        // Note d'un autre étudiant (autre cours) : ne doit pas apparaître
        $course3 = Course::factory()->create();
        Grade::factory()->published()->create([
            'student_id' => $other->id,
            'course_id'  => $course3->id,
            'created_by' => $prof->id,
        ]);

        $grades = $this->getJson('/api/grades', $ctx['headers'])->assertOk()->json();

        $this->assertCount(1, $grades);
        $this->assertEquals($ctx['user']->id, $grades[0]['student_id']);
        $this->assertEquals('published', $grades[0]['status']);
    }

    #[Test]
    public function student_cannot_list_concours_codes(): void
    {
        $this->getJson('/api/codes/concours', $this->authHeaders('etudiant_concours'))->assertForbidden();
    }

    #[Test]
    public function admin_can_list_concours_codes(): void
    {
        $this->getJson('/api/codes/concours', $this->authHeaders('admin'))->assertOk();
    }
}
