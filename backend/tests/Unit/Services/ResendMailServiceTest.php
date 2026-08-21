<?php

namespace Tests\Unit\Services;

use App\Services\ResendMailService;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ResendMailServiceTest extends TestCase
{
    #[Test]
    public function it_calls_resend_api_with_correct_payload(): void
    {
        Http::fake(['https://api.resend.com/emails' => Http::response(['id' => 'test-id'], 200)]);

        $service = new ResendMailService();
        $result  = $service->send('recipient@test.com', 'Sujet test', '<p>Corps HTML</p>');

        $this->assertTrue($result);

        Http::assertSent(function (Request $request) {
            return $request->url() === 'https://api.resend.com/emails'
                && $request->data()['to'] === ['recipient@test.com']
                && $request->data()['subject'] === 'Sujet test';
        });
    }

    #[Test]
    public function it_returns_false_when_api_fails(): void
    {
        Http::fake(['https://api.resend.com/emails' => Http::response(['error' => 'Invalid key'], 401)]);

        $service = new ResendMailService();
        $result  = $service->send('bad@test.com', 'Sujet', '<p>Corps</p>');

        $this->assertFalse($result);
    }

    #[Test]
    public function send_password_reset_uses_correct_template(): void
    {
        Http::fake(['https://api.resend.com/emails' => Http::response(['id' => 'ok'], 200)]);

        $service = new ResendMailService();
        $result  = $service->sendPasswordReset('user@test.com', 'Jean Dupont', '123456');

        $this->assertTrue($result);

        Http::assertSent(function (Request $request) {
            $html = $request->data()['html'];
            return str_contains($html, '123456')
                && str_contains($html, 'Jean Dupont')
                && str_contains($request->data()['subject'], 'Réinitialisation');
        });
    }

    #[Test]
    public function it_sends_from_configured_address(): void
    {
        Http::fake(['https://api.resend.com/emails' => Http::response(['id' => 'ok'], 200)]);

        $service = new ResendMailService();
        $service->send('x@test.com', 'Sub', '<p>Body</p>');

        Http::assertSent(function (Request $request) {
            return str_contains($request->data()['from'], 'CFI-LINK');
        });
    }
}
