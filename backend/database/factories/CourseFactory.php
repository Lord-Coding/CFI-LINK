<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CourseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'        => fake()->words(3, true),
            'teacher_id'  => User::factory()->professor(),
            'filiere'     => 'LIC',
            'annee'       => 'L1',
            'option_lic'  => null,
            'hours'       => fake()->numberBetween(20, 60),
            'semester'    => fake()->randomElement(['S1', 'S2', 'S3', 'S4', 'S5', 'S6']),
            'description' => fake()->sentence(),
        ];
    }
}
