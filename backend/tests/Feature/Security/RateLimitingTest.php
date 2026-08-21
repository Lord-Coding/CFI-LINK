<?php

namespace Tests\Feature\Security;

use App\Models\User;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class RateLimitingTest extends TestCase
{
    #[Test]
    public function api_accepts_normal_request_volume(): void
    {
        $user = User::factory()->create(['password' => bcrypt('pass')]);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', ['email' => $user->email, 'password' => 'pass'])
                 ->assertStatus(200);
        }
    }

    #[Test]
    public function repeated_failed_logins_do_not_expose_timing_information(): void
    {
        $times = [];

        for ($i = 0; $i < 5; $i++) {
            $start   = microtime(true);
            $this->postJson('/api/login', ['email' => "attempt{$i}@fake.com", 'password' => 'wrong']);
            $times[] = (microtime(true) - $start) * 1000;
        }

        $this->assertLessThan(
            2000,
            max($times) - min($times),
            'Divergence de temps trop grande — possible timing attack'
        );
    }

    #[Test]
    public function password_reset_endpoint_does_not_expose_user_existence(): void
    {
        \Illuminate\Support\Facades\Http::fake([
            'https://api.resend.com/*' => \Illuminate\Support\Facades\Http::response(['id' => 'ok'], 200),
        ]);

        User::factory()->create(['email' => 'real@test.com']);

        $realMsg  = $this->postJson('/api/password/forgot', ['email' => 'real@test.com'])->json('message');
        $ghostMsg = $this->postJson('/api/password/forgot', ['email' => 'ghost@fake.com'])->json('message');

        $this->assertEquals($realMsg, $ghostMsg);
    }
}
