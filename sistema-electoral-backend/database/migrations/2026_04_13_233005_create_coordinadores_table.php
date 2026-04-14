<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coordinadores', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_completo');
            $table->string('cedula', 20)->unique();
            $table->string('telefono', 20)->nullable();
            $table->foreignId('zona_id')->constrained('zonas')->cascadeOnDelete();
            $table->foreignId('jefe_zona_id')->nullable()->constrained('jefes_zona')->nullOnDelete();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coordinadores');
    }
};
