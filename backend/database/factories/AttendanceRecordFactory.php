<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AttendanceRecordFactory extends Factory
{
    public function definition(): array
    {
        return [
            'student_id' => User::factory()->student(),
            'course_id'  => Course::factory(),
            // Génère un timestamp unique basé sur microtime pour éviter les doublons
            'date'       => now()->subDays(fake()->unique()->numberBetween(1, 3650))->format('Y-m-d'),
            'status'     => fake()->randomElement(['present', 'absent', 'late', 'excused']),
            'marked_by'  => User::factory()->professor(),
        ];
    }
}
