<?php

namespace Tests\Feature\Performance;

use App\Models\Course;
use App\Models\Grade;
use App\Models\User;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class LoadTest extends TestCase
{
    #[Test]
    public function handles_50_sequential_login_requests(): void
    {
        $users = User::factory()->count(10)->create(['password' => bcrypt('LoadTest@1')]);

        $start = microtime(true);

        for ($i = 0; $i < 50; $i++) {
            $this->postJson('/api/login', [
                'email'    => $users->random()->email,
                'password' => 'LoadTest@1',
            ])->assertOk();
        }

        $totalMs = (microtime(true) - $start) * 1000;
        $this->assertLessThan(10000, $totalMs, "50 logins: {$totalMs}ms > 10s");
    }

    #[Test]
    public function concurrent_grade_reads_return_consistent_data(): void
    {
        $ctx    = $this->actingAsRole('admin');
        $course = Course::factory()->create();
        Grade::factory()->count(20)->create(['course_id' => $course->id]);

        $counts = [];
        for ($i = 0; $i < 10; $i++) {
            $counts[] = count($this->getJson('/api/grades', $ctx['headers'])->json());
        }

        $this->assertCount(1, array_unique($counts), 'Lectures incohérentes : résultats différents selon la requête');
    }

    #[Test]
    public function memory_usage_stays_reasonable_with_large_dataset(): void
    {
        $ctx = $this->actingAsRole('admin');
        User::factory()->count(200)->create();

        $memBefore = memory_get_usage(true);
        $this->getJson('/api/users', $ctx['headers'])->assertOk();
        $usedMB = (memory_get_usage(true) - $memBefore) / 1024 / 1024;

        $this->assertLessThan(32, $usedMB, "Consommation mémoire trop élevée : {$usedMB} MB");
    }
}
