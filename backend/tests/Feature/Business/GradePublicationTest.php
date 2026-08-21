<?php

namespace Tests\Feature\Business;

use App\Models\Course;
use App\Models\Grade;
use App\Models\Notification;
use App\Models\User;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class GradePublicationTest extends TestCase
{
    #[Test]
    public function publishing_grades_sets_status_to_published(): void
    {
        $ctx    = $this->actingAsRole('professeur');
        $course = Course::factory()->create(['teacher_id' => $ctx['user']->id]);
        $studs  = User::factory()->student()->count(2)->create();

        foreach ($studs as $s) {
            Grade::factory()->create([
                'course_id'  => $course->id,
                'student_id' => $s->id,
                'created_by' => $ctx['user']->id,
                'status'     => 'draft',
            ]);
        }

        $this->postJson("/api/grades/publish/{$course->id}", [], $ctx['headers'])->assertOk();

        foreach (Grade::where('course_id', $course->id)->get() as $g) {
            $this->assertEquals('published', $g->status);
        }
    }

    #[Test]
    public function publishing_grades_creates_notification_for_each_student(): void
    {
        $ctx    = $this->actingAsRole('professeur');
        $course = Course::factory()->create(['teacher_id' => $ctx['user']->id]);
        $studs  = User::factory()->student()->count(3)->create();

        foreach ($studs as $s) {
            Grade::factory()->create([
                'course_id'  => $course->id,
                'student_id' => $s->id,
                'created_by' => $ctx['user']->id,
                'status'     => 'draft',
            ]);
        }

        $this->postJson("/api/grades/publish/{$course->id}", [], $ctx['headers'])->assertOk();

        $this->assertEquals(3, Notification::where('type', 'note')->count());
    }

    #[Test]
    public function unpublishing_grades_sets_status_back_to_draft(): void
    {
        $ctx    = $this->actingAsRole('professeur');
        $course = Course::factory()->create(['teacher_id' => $ctx['user']->id]);
        $stud   = User::factory()->student()->create();

        Grade::factory()->published()->create([
            'course_id'  => $course->id,
            'student_id' => $stud->id,
            'created_by' => $ctx['user']->id,
        ]);

        $this->postJson("/api/grades/unpublish/{$course->id}", [], $ctx['headers'])->assertOk();

        $this->assertDatabaseHas('grades', ['course_id' => $course->id, 'status' => 'draft']);
    }

    #[Test]
    public function professor_can_upsert_grade(): void
    {
        $ctx    = $this->actingAsRole('professeur');
        $course = Course::factory()->create(['teacher_id' => $ctx['user']->id]);
        $stud   = User::factory()->student()->create();

        $this->putJson('/api/grades/upsert', [
            'student_id' => $stud->id,
            'course_id'  => $course->id,
            'semestre'   => 'S1',
            'filiere'    => 'LIC',
            'annee'      => 'L1',
            'cc'         => 14,
            'tp'         => 15,
            'exam'       => 16,
            'coef'       => 2,
        ], $ctx['headers'])->assertStatus(201);

        $this->assertDatabaseHas('grades', ['student_id' => $stud->id, 'course_id' => $course->id, 'cc' => 14]);
    }
}
