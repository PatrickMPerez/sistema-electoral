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
        Schema::table('locales_votacion', function (Blueprint $table) {
            $table->string('localidad')->nullable()->change();
            $table->string('direccion')->nullable()->change();
            $table->unsignedBigInteger('zona_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('locales_votacion', function (Blueprint $table) {
            $table->string('localidad')->nullable(false)->change();
            $table->string('direccion')->nullable(false)->change();
        });
    }
};
