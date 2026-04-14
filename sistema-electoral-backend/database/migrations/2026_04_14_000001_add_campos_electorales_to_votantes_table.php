<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('votantes', function (Blueprint $table) {
            // Separar nombre en dos campos distintos
            $table->string('nombres', 150)->nullable()->after('nombre_completo');
            $table->string('apellidos', 150)->nullable()->after('nombres');

            // Datos electorales del padrón
            $table->string('departamento', 100)->nullable()->after('apellidos');
            $table->string('distrito', 100)->nullable()->after('departamento');
            $table->string('seccional', 150)->nullable()->after('distrito');
            $table->unsignedInteger('mesa')->nullable()->after('seccional');
        });
    }

    public function down(): void
    {
        Schema::table('votantes', function (Blueprint $table) {
            $table->dropColumn(['nombres', 'apellidos', 'departamento', 'distrito', 'seccional', 'mesa']);
        });
    }
};
