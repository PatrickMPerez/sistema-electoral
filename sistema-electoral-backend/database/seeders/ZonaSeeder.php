<?php
namespace Database\Seeders;
use App\Models\Zona;
use Illuminate\Database\Seeder;

class ZonaSeeder extends Seeder
{
    public function run(): void
    {
        Zona::create(['nombre_zona' => 'Zona Norte', 'jefe_zona_id' => 1]);
        Zona::create(['nombre_zona' => 'Zona Sur',   'jefe_zona_id' => 2]);
    }
}
