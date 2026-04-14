<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LimpiarSimulacionSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🗑️  Limpiando datos de simulación...');

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('auditoria')->truncate();
        DB::table('marcaciones_voto')->truncate();
        DB::table('votantes')->truncate();
        DB::table('personal_access_tokens')->truncate();
        DB::table('users')->truncate();
        DB::table('coordinadores')->truncate();
        DB::table('locales_votacion')->truncate();
        DB::table('zonas')->truncate();
        DB::table('jefes_zona')->truncate();
        DB::table('movimientos')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('✅  Base de datos limpiada. Sistema listo para datos reales.');
    }
}
