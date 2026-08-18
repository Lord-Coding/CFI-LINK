<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('teacher_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('filiere', ['LIC', 'LAP']);
            $table->enum('annee', ['L1', 'L2', 'L3']);
            $table->enum('option_lic', ['GL', 'SR'])->nullable();
            $table->unsignedSmallInteger('hours')->default(40);
            $table->enum('semester', ['S1', 'S2', 'S3', 'S4', 'S5', 'S6']);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->string('title');
            $table->enum('type', ['video', 'document', 'quiz', 'exam']);
            $table->string('duration')->nullable();
            $table->string('file_url')->nullable();
            $table->boolean('locked')->default(false);
            $table->unsignedSmallInteger('order')->default(0);
            $table->json('quiz_data')->nullable();
            $table->timestamps();
        });

        Schema::create('lesson_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->boolean('completed')->default(false);
            $table->unsignedTinyInteger('score')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'lesson_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_progress');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('courses');
    }
};
