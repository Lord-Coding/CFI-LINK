<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('nom_complet');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', [
                'super_admin', 'admin', 'professeur',
                'membre_administratif', 'etudiant_concours', 'etudiant_externe',
            ])->default('etudiant_externe');
            $table->boolean('is_active')->default(true);
            $table->boolean('payment_blocked')->default(false);
            // Champs étudiants
            $table->enum('filiere', ['LIC', 'LAP'])->nullable();
            $table->enum('annee', ['L1', 'L2', 'L3'])->nullable();
            $table->enum('option_lic', ['GL', 'SR'])->nullable();
            // Champs professeurs
            $table->string('specialite')->nullable();
            $table->string('grade')->nullable();
            // Champs staff
            $table->string('service')->nullable();
            $table->enum('staff_role', ['secretariat', 'comptable', 'responsable_scolarite'])->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
