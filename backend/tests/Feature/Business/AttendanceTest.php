<?php

namespace Tests\Feature\Business;

use App\Models\AttendanceRecord;
use App\Models\Course;
use App\Models\User;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AttendanceTest extends TestCase
{
    #[Test]
    public function professor_can_mark_student_present(): void
    {
        $ctx    = $this->actingAsRole('professeur');
        $course = Course::factory()->create(['teacher_id' => $ctx['user']->id]);
        $stud   = User::factory()->student()->create();

        $this->postJson('/api/attendance/upsert', [
            'student_id' => $stud->id,
            'course_id'  => $course->id,
            'date'       => '2024-10-15',
            'status'     => 'present',
        ], $ctx['headers'])->assertStatus(201);

        $this->assertDatabaseHas('attendance_records', [
            'student_id' => $stud->id,
            'course_id'  => $course->id,
            'status'     => 'present',
        ]);
    }

    #[Test]
    public function marking_absent_triggers_notification(): void
    {
        $ctx    = $this->actingAsRole('professeur');
        $course = Course::factory()->create(['teacher_id' => $ctx['user']->id]);
        $stud   = User::factory()->student()->create();

        $this->postJson('/api/attendance/upsert', [
            'student_id' => $stud->id,
            'course_id'  => $course->id,
            'date'       => '2024-10-16',
            'status'     => 'absent',
        ], $ctx['headers'])->assertStatus(201);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $stud->id,
            'type'    => 'systeme',
        ]);
    }

    #[Test]
    public function upsert_updates_existing_record_for_same_day(): void
    {
        $ctx    = $this->actingAsRole('professeur');
        $course = Course::factory()->create(['teacher_id' => $ctx['user']->id]);
        $stud   = User::factory()->student()->create();
        $base   = ['student_id' => $stud->id, 'course_id' => $course->id, 'date' => '2024-10-17'];

        $this->postJson('/api/attendance/upsert', array_merge($base, ['status' => 'present']), $ctx['headers']);
        $this->postJson('/api/attendance/upsert', array_merge($base, ['status' => 'absent']),  $ctx['headers']);

        // Exactement 1 enregistrement (upsert, pas insert)
        $this->assertEquals(
            1,
            AttendanceRecord::where(['student_id' => $stud->id, 'course_id' => $course->id])->count()
        );
        $this->assertDatabaseHas('attendance_records', [
            'student_id' => $stud->id,
            'course_id'  => $course->id,
            'status'     => 'absent',
        ]);
    }

    #[Test]
    public function attendance_stats_are_calculated_correctly(): void
    {
        $ctx    = $this->actingAsRole('etudiant_concours');
        $stud   = $ctx['user'];
        $course = Course::factory()->create();

        // Utiliser des dates différentes pour éviter la contrainte unique (student+course+date)
        $statuses = [
            'present', 'present', 'present', 'present', 'present', 'present', 'present', // 7 présents
            'absent', 'absent',   // 2 absents
            'late',               // 1 en retard
        ];
        foreach ($statuses as $i => $status) {
            AttendanceRecord::create([
                'student_id' => $stud->id,
                'course_id'  => $course->id,
                'date'       => now()->subDays($i + 1)->format('Y-m-d'),
                'status'     => $status,
                'marked_by'  => null,
            ]);
        }

        $this->getJson("/api/attendance/stats/{$stud->id}", $ctx['headers'])
             ->assertOk()
             ->assertJsonPath('total',   10)
             ->assertJsonPath('present', 7)
             ->assertJsonPath('absent',  2)
             ->assertJsonPath('late',    1)
             ->assertJsonPath('rate',    80); // (7+1)/10 * 100
    }
}
