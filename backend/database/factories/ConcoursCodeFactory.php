<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ConcoursCodeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code'        => 'CONC-' . strtoupper(fake()->lexify('??????')),
            'nom_complet' => fake()->name(),
            'filiere'     => fake()->randomElement(['LIC', 'LAP']),
            'annee'       => fake()->randomElement(['L1', 'L2', 'L3']),
            'option_lic'  => null,
            'used'        => false,
            'used_by'     => null,
        ];
    }

    public function used(\App\Models\User $user): static
    {
        return $this->state(['used' => true, 'used_by' => $user->id]);
    }
}
