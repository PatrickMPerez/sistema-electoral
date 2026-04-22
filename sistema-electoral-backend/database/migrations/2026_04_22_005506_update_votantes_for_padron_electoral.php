<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('votantes', function (Blueprint $table) {
            // Hacer zona_id y coordinador_id opcionales para importación desde padrón
            $table->dropForeign(['zona_id']);
            $table->dropForeign(['coordinador_id']);
            $table->unsignedBigInteger('zona_id')->nullable()->change();
            $table->unsignedBigInteger('coordinador_id')->nullable()->change();
            $table->foreign('zona_id')->references('id')->on('zonas')->nullOnDelete();
            $table->foreign('coordinador_id')->references('id')->on('coordinadores')->nullOnDelete();

            // Nuevos campos del padrón electoral
            $table->date('fecha_nacimiento')->nullable()->after('numero_orden');
            $table->string('direccion', 500)->nullable()->after('fecha_nacimiento');
            $table->date('fecha_afiliacion')->nullable()->after('direccion');
        });
    }

    public function down(): void
    {
        Schema::table('votantes', function (Blueprint $table) {
            $table->dropColumn(['fecha_nacimiento', 'direccion', 'fecha_afiliacion']);

            $table->dropForeign(['zona_id']);
            $table->dropForeign(['coordinador_id']);
            $table->unsignedBigInteger('zona_id')->nullable(false)->change();
            $table->unsignedBigInteger('coordinador_id')->nullable(false)->change();
            $table->foreign('zona_id')->references('id')->on('zonas')->cascadeOnDelete();
            $table->foreign('coordinador_id')->references('id')->on('coordinadores')->cascadeOnDelete();
        });
    }
};
