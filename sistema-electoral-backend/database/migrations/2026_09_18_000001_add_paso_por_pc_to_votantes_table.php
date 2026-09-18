<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('votantes', function (Blueprint $table) {
            $table->boolean('paso_por_pc')->default(false)->after('estado_votacion');
        });
    }

    public function down(): void
    {
        Schema::table('votantes', function (Blueprint $table) {
            $table->dropColumn('paso_por_pc');
        });
    }
};
