<?php

namespace Tests\Feature\Security;

use App\Models\User;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class InjectionTest extends TestCase
{
    public static function sqlPayloads(): array
    {
        return [
            ["' OR '1'='1"],
            ["'; DROP TABLE users; --"],
            ["1' AND SLEEP(5)--"],
            ["1 UNION SELECT * FROM users --"],
            ["admin'--"],
        ];
    }

    #[Test]
    #[DataProvider('sqlPayloads')]
    public function sql_injection_in_login_email_is_neutralized(string $payload): void
    {
        $response = $this->postJson('/api/login', ['email' => $payload, 'password' => 'anything']);

        $this->assertContains(
            $response->getStatusCode(),
            [401, 422],
            "Payload SQL [{$payload}] a retourné HTTP {$response->getStatusCode()}"
        );
    }

    #[Test]
    public function sql_injection_in_search_parameter_is_safe(): void
    {
        $headers = $this->authHeaders('admin');

        foreach (["' OR 1=1--", "'; DROP TABLE users;--", "1 UNION SELECT null--"] as $payload) {
            $response = $this->getJson('/api/users?search=' . urlencode($payload), $headers);
            $response->assertOk();
            $this->assertIsArray($response->json());
        }
    }

    #[Test]
    public function xss_payload_is_stored_as_plain_text(): void
    {
        $xss = '<script>alert("XSS")</script>';

        $this->postJson('/api/users', [
            'nom_complet' => $xss,
            'email'       => 'xss@test.com',
            'password'    => 'Secret@123',
            'role'        => 'professeur',
        ], $this->authHeaders('admin'))->assertCreated();

        $this->assertDatabaseHas('users', ['nom_complet' => $xss]);
    }

    #[Test]
    public function non_fillable_fields_are_ignored_on_user_creation(): void
    {
        $this->postJson('/api/users', [
            'nom_complet' => 'Hacker Test',
            'email'       => 'mass@test.com',
            'password'    => 'Secret@123',
            'role'        => 'professeur',
            'id'          => 99999,
        ], $this->authHeaders('admin'))->assertCreated();

        $this->assertDatabaseMissing('users', ['id' => 99999, 'email' => 'mass@test.com']);
        $this->assertDatabaseHas('users', ['email' => 'mass@test.com']);
    }

    #[Test]
    public function path_traversal_in_ids_does_not_expose_other_resources(): void
    {
        $this->getJson('/api/users/../../../etc/passwd', $this->authHeaders('admin'))
             ->assertStatus(404);
    }
}
