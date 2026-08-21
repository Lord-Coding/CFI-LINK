<?php

namespace Tests\Feature\Validation;

use App\Models\Course;
use App\Models\User;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ValidationTest extends TestCase
{
    #[Test]
    public function creating_user_with_existing_email_returns_422(): void
    {
        User::factory()->create(['email' => 'duplicate@test.com']);

        $this->postJson('/api/users', [
            'nom_complet' => 'Autre',
            'email'       => 'duplicate@test.com',
            'password'    => 'Secret@123',
            'role'        => 'professeur',
        ], $this->authHeaders('admin'))
             ->assertStatus(422)
             ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function creating_user_without_required_fields_returns_422(): void
    {
        $this->postJson('/api/users', [], $this->authHeaders('admin'))
             ->assertStatus(422)
             ->assertJsonValidationErrors(['nom_complet', 'email', 'password', 'role']);
    }

    #[Test]
    public function creating_user_with_invalid_role_returns_422(): void
    {
        $this->postJson('/api/users', [
            'nom_complet' => 'Test',
            'email'       => 'test@test.com',
            'password'    => 'Secret@123',
            'role'        => 'directeur_supreme',
        ], $this->authHeaders('admin'))
             ->assertStatus(422)
             ->assertJsonValidationErrors(['role']);
    }

    #[Test]
    public function grade_above_20_returns_422(): void
    {
        $ctx    = $this->actingAsRole('professeur');
        $course = Course::factory()->create(['teacher_id' => $ctx['user']->id]);
        $stud   = User::factory()->student()->create();

        $this->putJson('/api/grades/upsert', [
            'student_id' => $stud->id, 'course_id' => $course->id,
            'semestre' => 'S1', 'filiere' => 'LIC', 'annee' => 'L1',
            'cc' => 25, 'coef' => 2,
        ], $ctx['headers'])->assertStatus(422)->assertJsonValidationErrors(['cc']);
    }

    #[Test]
    public function grade_below_0_returns_422(): void
    {
        $ctx    = $this->actingAsRole('professeur');
        $course = Course::factory()->create(['teacher_id' => $ctx['user']->id]);
        $stud   = User::factory()->student()->create();

        $this->putJson('/api/grades/upsert', [
            'student_id' => $stud->id, 'course_id' => $course->id,
            'semestre' => 'S1', 'filiere' => 'LIC', 'annee' => 'L1',
            'exam' => -5, 'coef' => 2,
        ], $ctx['headers'])->assertStatus(422)->assertJsonValidationErrors(['exam']);
    }

    #[Test]
    public function invalid_filiere_on_user_creation_returns_422(): void
    {
        $this->postJson('/api/users', [
            'nom_complet' => 'Test',
            'email'       => 'ok@test.com',
            'password'    => 'Secret@123',
            'role'        => 'etudiant_concours',
            'filiere'     => 'MATH',
        ], $this->authHeaders('admin'))->assertStatus(422)->assertJsonValidationErrors(['filiere']);
    }

    #[Test]
    public function attendance_with_invalid_status_returns_422(): void
    {
        $ctx    = $this->actingAsRole('professeur');
        $course = Course::factory()->create(['teacher_id' => $ctx['user']->id]);
        $stud   = User::factory()->student()->create();

        $this->postJson('/api/attendance/upsert', [
            'student_id' => $stud->id,
            'course_id'  => $course->id,
            'date'       => '2024-10-01',
            'status'     => 'en_vacances',
        ], $ctx['headers'])->assertStatus(422)->assertJsonValidationErrors(['status']);
    }

    #[Test]
    public function attendance_with_invalid_date_format_returns_422(): void
    {
        $ctx    = $this->actingAsRole('professeur');
        $course = Course::factory()->create(['teacher_id' => $ctx['user']->id]);
        $stud   = User::factory()->student()->create();

        $this->postJson('/api/attendance/upsert', [
            'student_id' => $stud->id,
            'course_id'  => $course->id,
            'date'       => '01/10/2024',
            'status'     => 'present',
        ], $ctx['headers'])->assertStatus(422)->assertJsonValidationErrors(['date']);
    }

    #[Test]
    public function payment_with_invalid_method_returns_422(): void
    {
        $ctx = $this->actingAsRole('etudiant_concours');

        $this->postJson('/api/payments', [
            'month'  => 'Janvier 2025',
            'amount' => 25000,
            'method' => 'bitcoin',
        ], $ctx['headers'])->assertStatus(422)->assertJsonValidationErrors(['method']);
    }

    #[Test]
    public function semester_with_invalid_type_returns_422(): void
    {
        $this->postJson('/api/semesters', [
            'name'       => 'Test Sem',
            'year'       => '2024-2025',
            'start_date' => '2024-10-01',
            'end_date'   => '2025-01-31',
            'type'       => 'S9',
        ], $this->authHeaders('admin'))->assertStatus(422)->assertJsonValidationErrors(['type']);
    }

    #[Test]
    public function semester_end_before_start_returns_422(): void
    {
        $this->postJson('/api/semesters', [
            'name'       => 'Test Sem',
            'year'       => '2024-2025',
            'start_date' => '2025-01-31',
            'end_date'   => '2024-10-01',
            'type'       => 'S1',
        ], $this->authHeaders('admin'))->assertStatus(422)->assertJsonValidationErrors(['end_date']);
    }

    #[Test]
    public function concours_code_creation_requires_filiere(): void
    {
        $this->postJson('/api/codes/concours', [
            'nom_complet' => 'Test Étudiant',
            'annee'       => 'L1',
        ], $this->authHeaders('admin'))->assertStatus(422)->assertJsonValidationErrors(['filiere']);
    }
}
