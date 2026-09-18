<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marcaciones_pc', function (Blueprint $table) {
            $table->id();
            $table->foreignId('votante_id')->constrained('votantes')->cascadeOnDelete();
            $table->dateTime('fecha_hora_marcacion');
            $table->foreignId('usuario_pc_id')->constrained('users')->cascadeOnDelete();
            $table->boolean('premio_entregado')->default(true);
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marcaciones_pc');
    }
};
