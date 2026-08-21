<?php

namespace Tests\Feature\Performance;

use App\Models\AttendanceRecord;
use App\Models\AuditLog;
use App\Models\Course;
use App\Models\Grade;
use App\Models\PaymentRecord;
use App\Models\User;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ResponseTimeTest extends TestCase
{
    private const MAX_SIMPLE_MS = 500;
    private const MAX_LOAD_MS   = 1000;

    private function measureMs(callable $request): float
    {
        $start = microtime(true);
        $request();
        return (microtime(true) - $start) * 1000;
    }

    #[Test]
    public function login_responds_within_threshold(): void
    {
        $user = User::factory()->create(['password' => bcrypt('pass')]);

        $ms = $this->measureMs(fn() => $this->postJson('/api/login', [
            'email' => $user->email, 'password' => 'pass',
        ]));

        $this->assertLessThan(self::MAX_SIMPLE_MS, $ms, "Login: {$ms}ms > seuil de " . self::MAX_SIMPLE_MS . 'ms');
    }

    #[Test]
    public function user_list_with_50_users_responds_within_threshold(): void
    {
        User::factory()->count(50)->create();
        $headers = $this->authHeaders('admin');

        $ms = $this->measureMs(fn() => $this->getJson('/api/users', $headers));

        $this->assertLessThan(self::MAX_LOAD_MS, $ms, "User list (50): {$ms}ms > seuil");
    }

    #[Test]
    public function grade_list_with_100_grades_responds_within_threshold(): void
    {
        $ctx    = $this->actingAsRole('admin');
        $course = Course::factory()->create();
        Grade::factory()->count(100)->create(['course_id' => $course->id]);

        $ms = $this->measureMs(fn() => $this->getJson('/api/grades', $ctx['headers']));

        $this->assertLessThan(self::MAX_LOAD_MS, $ms, "Grades (100): {$ms}ms > seuil");
    }

    #[Test]
    public function attendance_list_with_200_records_responds_within_threshold(): void
    {
        $ctx = $this->actingAsRole('admin');

        // Créer 200 enregistrements avec des combinaisons student+course+date uniques
        $students = User::factory()->student()->count(20)->create();
        $courses  = Course::factory()->count(10)->create();

        $inserted = 0;
        foreach ($students as $si => $student) {
            foreach ($courses as $ci => $course) {
                if ($inserted >= 200) break 2;
                \App\Models\AttendanceRecord::create([
                    'student_id' => $student->id,
                    'course_id'  => $course->id,
                    'date'       => now()->subDays($si * 10 + $ci + 1)->format('Y-m-d'),
                    'status'     => 'present',
                    'marked_by'  => null,
                ]);
                $inserted++;
            }
        }

        $ms = $this->measureMs(fn() => $this->getJson('/api/attendance', $ctx['headers']));

        $this->assertLessThan(self::MAX_LOAD_MS, $ms, "Attendance (200): {$ms}ms > seuil");
    }

    #[Test]
    public function payment_list_with_150_records_responds_within_threshold(): void
    {
        $ctx = $this->actingAsRole('admin');
        PaymentRecord::factory()->count(150)->create();

        $ms = $this->measureMs(fn() => $this->getJson('/api/payments', $ctx['headers']));

        $this->assertLessThan(self::MAX_LOAD_MS, $ms, "Payments (150): {$ms}ms > seuil");
    }

    #[Test]
    public function audit_log_with_500_entries_responds_within_threshold(): void
    {
        $admin = User::factory()->admin()->create();
        AuditLog::factory()->count(500)->create(['user_id' => $admin->id]);

        $token   = $admin->createToken('t')->plainTextToken;
        $headers = ['Authorization' => "Bearer {$token}", 'Accept' => 'application/json'];

        $ms = $this->measureMs(fn() => $this->getJson('/api/audit-logs', $headers));

        // SQLite in-memory est plus lent qu'une vraie DB — seuil élargi à 3s
        $this->assertLessThan(3000, $ms, "AuditLog (500): {$ms}ms > seuil de 3000ms");
    }
}
