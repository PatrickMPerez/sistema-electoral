<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marcaciones_voto', function (Blueprint $table) {
            $table->id();
            $table->foreignId('votante_id')->constrained('votantes')->cascadeOnDelete();
            $table->unsignedInteger('numero_orden');
            $table->datetime('fecha_hora_marcacion');
            $table->foreignId('usuario_veedor_id')->constrained('users')->cascadeOnDelete();
            $table->string('mesa', 20)->nullable();
            $table->text('observacion')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marcaciones_voto');
    }
};
