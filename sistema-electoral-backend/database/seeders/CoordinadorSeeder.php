<?php
namespace Database\Seeders;
use App\Models\Coordinador;
use Illuminate\Database\Seeder;

class CoordinadorSeeder extends Seeder
{
    public function run(): void
    {
        Coordinador::create(['nombre_completo' => 'Luis Fernández', 'cedula' => '33333333', 'telefono' => '3511111111', 'zona_id' => 1, 'jefe_zona_id' => 1]);
        Coordinador::create(['nombre_completo' => 'Patricia Ruiz',  'cedula' => '44444444', 'telefono' => '3512222222', 'zona_id' => 2, 'jefe_zona_id' => 2]);
    }
}
