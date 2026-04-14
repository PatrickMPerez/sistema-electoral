<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('zona_id')->nullable()->constrained('zonas')->nullOnDelete()->after('activo');
            $table->foreignId('jefe_zona_id')->nullable()->constrained('jefes_zona')->nullOnDelete()->after('zona_id');
            $table->foreignId('coordinador_id')->nullable()->constrained('coordinadores')->nullOnDelete()->after('jefe_zona_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['zona_id', 'jefe_zona_id', 'coordinador_id']);
            $table->dropColumn(['zona_id', 'jefe_zona_id', 'coordinador_id']);
        });
    }
};
