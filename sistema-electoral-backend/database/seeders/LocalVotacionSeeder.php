<?php
namespace Database\Seeders;
use App\Models\LocalVotacion;
use Illuminate\Database\Seeder;

class LocalVotacionSeeder extends Seeder
{
    public function run(): void
    {
        LocalVotacion::create(['nombre_local' => 'Escuela N1', 'localidad' => 'Barrio Norte', 'direccion' => 'Av. Norte 100', 'zona_id' => 1]);
        LocalVotacion::create(['nombre_local' => 'Escuela N2', 'localidad' => 'Barrio Sur',   'direccion' => 'Av. Sur 200',   'zona_id' => 2]);
    }
}
