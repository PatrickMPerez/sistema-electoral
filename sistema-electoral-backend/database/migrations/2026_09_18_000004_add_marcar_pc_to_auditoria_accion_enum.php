<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE auditoria MODIFY COLUMN accion ENUM('crear','editar','importar','marcar_voto','eliminar','marcar_pc') NOT NULL");
    }

    public function down(): void
    {
        DB::table('auditoria')->where('accion', 'marcar_pc')->delete();
        DB::statement("ALTER TABLE auditoria MODIFY COLUMN accion ENUM('crear','editar','importar','marcar_voto','eliminar') NOT NULL");
    }
};
