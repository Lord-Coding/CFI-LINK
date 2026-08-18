<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('concours_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('nom_complet');
            $table->enum('filiere', ['LIC', 'LAP']);
            $table->enum('annee', ['L1', 'L2', 'L3']);
            $table->enum('option_lic', ['GL', 'SR'])->nullable();
            $table->boolean('used')->default(false);
            $table->foreignId('used_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('concours_codes');
    }
};
