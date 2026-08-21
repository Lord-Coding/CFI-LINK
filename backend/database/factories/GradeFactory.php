<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class GradeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'student_id' => User::factory()->student(),
            'course_id'  => Course::factory(),
            'semestre'   => 'S1',
            'filiere'    => 'LIC',
            'annee'      => 'L1',
            'cc'         => fake()->randomFloat(2, 0, 20),
            'tp'         => fake()->randomFloat(2, 0, 20),
            'exam'       => fake()->randomFloat(2, 0, 20),
            'coef'       => 2,
            'status'     => 'draft',
            'created_by' => User::factory()->professor(),
        ];
    }

    public function published(): static
    {
        return $this->state(['status' => 'published']);
    }
}
