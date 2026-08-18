<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_entries', function (Blueprint $table) {
            $table->id();
            $table->string('day');      // "Lundi"
            $table->string('hour');     // "08:00"
            $table->string('subject');
            $table->string('room')->nullable();
            $table->string('teacher')->nullable(); // nom affiché
            $table->foreignId('teacher_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('filiere', ['LIC', 'LAP']);
            $table->enum('annee', ['L1', 'L2', 'L3']);
            $table->enum('option_lic', ['GL', 'SR'])->nullable();
            $table->string('color')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_entries');
    }
};
