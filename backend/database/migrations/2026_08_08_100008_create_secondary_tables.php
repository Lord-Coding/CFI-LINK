<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Annonces ──────────────────────────────────────────────
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('priority', ['normal', 'important', 'urgent'])->default('normal');
            $table->string('target_role')->nullable(); // 'all' ou Role
            $table->boolean('pinned')->default(false);
            $table->timestamps();
        });

        // ── Notifications ─────────────────────────────────────────
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('target_role')->nullable();
            $table->enum('type', ['annonce', 'note', 'paiement', 'systeme', 'cours']);
            $table->string('title');
            $table->text('message');
            $table->boolean('read')->default(false);
            $table->timestamps();
        });

        // ── Messages internes ─────────────────────────────────────
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('from_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('to_id')->constrained('users')->cascadeOnDelete();
            $table->string('subject');
            $table->text('body');
            $table->boolean('read')->default(false);
            $table->timestamps();
        });

        // ── Demandes de documents ─────────────────────────────────
        Schema::create('document_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->enum('type', [
                'attestation_inscription', 'releve_notes',
                'certificat_scolarite', 'attestation_reussite',
            ]);
            $table->enum('status', ['pending', 'approved', 'rejected', 'ready'])->default('pending');
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('processed_at')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // ── Bibliothèque ──────────────────────────────────────────
        Schema::create('library_items', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('author');
            $table->enum('category', ['book', 'article', 'thesis', 'guide', 'manual']);
            $table->string('filiere')->nullable();
            $table->text('description')->nullable();
            $table->enum('file_type', ['pdf', 'doc', 'video'])->default('pdf');
            $table->string('size')->nullable();
            $table->string('file_url')->nullable();
            $table->unsignedInteger('downloads')->default(0);
            $table->foreignId('added_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // ── Événements calendrier ─────────────────────────────────
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('date');
            $table->time('time')->nullable();
            $table->enum('type', ['exam', 'deadline', 'event', 'holiday', 'meeting']);
            $table->string('target_role')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // ── Communauté ────────────────────────────────────────────
        Schema::create('community_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->text('content');
            $table->timestamps();
        });

        Schema::create('community_post_likes', function (Blueprint $table) {
            $table->foreignId('post_id')->constrained('community_posts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->primary(['post_id', 'user_id']);
        });

        // ── Forum ─────────────────────────────────────────────────
        Schema::create('forum_posts', function (Blueprint $table) {
            $table->id();
            $table->string('course_id')->default('general');
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('content');
            $table->boolean('pinned')->default(false);
            $table->timestamps();
        });

        Schema::create('forum_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('forum_posts')->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('forum_replies')->cascadeOnDelete();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->text('content');
            $table->timestamps();
        });

        // ── Audit Log ─────────────────────────────────────────────
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->text('details')->nullable();
            $table->string('category'); // auth, user, payment, code, document, system, grade
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('forum_replies');
        Schema::dropIfExists('forum_posts');
        Schema::dropIfExists('community_post_likes');
        Schema::dropIfExists('community_posts');
        Schema::dropIfExists('calendar_events');
        Schema::dropIfExists('library_items');
        Schema::dropIfExists('document_requests');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('announcements');
    }
};
