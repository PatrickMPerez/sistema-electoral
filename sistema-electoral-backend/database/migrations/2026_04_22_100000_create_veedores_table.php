<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('veedores', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_completo');
            $table->string('cedula', 20)->unique();
            $table->string('telefono', 20)->nullable();
            $table->string('mesa', 20)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('veedor_id')->nullable()->constrained('veedores')->nullOnDelete()->after('coordinador_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['veedor_id']);
            $table->dropColumn('veedor_id');
        });
        Schema::dropIfExists('veedores');
    }
};
