<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locales_votacion', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_local');
            $table->string('localidad');
            $table->string('direccion')->nullable();
            $table->foreignId('zona_id')->constrained('zonas')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('locales_votacion');
    }
};
