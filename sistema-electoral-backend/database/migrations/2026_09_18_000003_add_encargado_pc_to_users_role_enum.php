<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('administrador','jefe_zona','coordinador','vedor','encargado_pc') NOT NULL DEFAULT 'vedor'");
    }

    public function down(): void
    {
        DB::table('users')->where('role', 'encargado_pc')->update(['role' => 'vedor']);
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('administrador','jefe_zona','coordinador','vedor') NOT NULL DEFAULT 'vedor'");
    }
};
