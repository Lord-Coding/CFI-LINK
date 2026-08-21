<?php

namespace Tests\Unit\Services;

use App\Models\AuditLog;
use App\Models\User;
use App\Services\AuditService;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AuditServiceTest extends TestCase
{
    private AuditService $audit;

    protected function setUp(): void
    {
        parent::setUp();
        $this->audit = new AuditService();
    }

    #[Test]
    public function it_creates_an_audit_entry_with_all_fields(): void
    {
        $user = User::factory()->admin()->create();

        $entry = $this->audit->log($user, 'Test action', 'Test details', 'system');

        $this->assertInstanceOf(AuditLog::class, $entry);
        $this->assertDatabaseHas('audit_logs', [
            'user_id'  => $user->id,
            'action'   => 'Test action',
            'details'  => 'Test details',
            'category' => 'system',
        ]);
    }

    #[Test]
    public function it_creates_entry_without_user(): void
    {
        $entry = $this->audit->log(null, 'Système démarré', 'Boot', 'system');

        $this->assertNull($entry->user_id);
        $this->assertEquals('Système démarré', $entry->action);
    }

    #[Test]
    public function it_stores_all_supported_categories(): void
    {
        $user       = User::factory()->create();
        $categories = ['auth', 'user', 'payment', 'code', 'document', 'system', 'grade'];

        foreach ($categories as $cat) {
            $this->audit->log($user, "Action {$cat}", '', $cat);
        }

        $this->assertDatabaseCount('audit_logs', count($categories));
    }
}
