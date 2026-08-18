<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->string('month'); // "2025-01"
            $table->boolean('used')->default(false);
            $table->timestamps();
        });

        Schema::create('payment_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->string('month');
            $table->unsignedInteger('amount')->default(25000);
            $table->enum('method', ['cash', 'mobile_money', 'card'])->default('cash');
            $table->enum('status', ['pending', 'confirmed', 'rejected'])->default('pending');
            $table->string('reference')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_records');
        Schema::dropIfExists('payment_codes');
    }
};
