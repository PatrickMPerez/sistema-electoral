<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('votantes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_completo');
            $table->string('cedula', 20)->unique();
            $table->string('telefono', 20)->nullable();
            $table->string('localidad')->nullable();
            $table->unsignedInteger('numero_orden')->index();
            $table->enum('estado_votacion', ['registrado', 'ya_voto'])->default('registrado');
            $table->foreignId('zona_id')->constrained('zonas')->cascadeOnDelete();
            $table->foreignId('coordinador_id')->constrained('coordinadores')->cascadeOnDelete();
            $table->foreignId('jefe_zona_id')->nullable()->constrained('jefes_zona')->nullOnDelete();
            $table->foreignId('movimiento_id')->nullable()->constrained('movimientos')->nullOnDelete();
            $table->foreignId('local_votacion_id')->nullable()->constrained('locales_votacion')->nullOnDelete();
            $table->foreignId('usuario_carga_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('votantes');
    }
};
