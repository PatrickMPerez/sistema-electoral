<?php
namespace Database\Seeders;
use App\Models\Votante;
use Illuminate\Database\Seeder;

class VotanteSeeder extends Seeder
{
    public function run(): void
    {
        $votantes = [
            ['nombre_completo' => 'Juan Pérez',     'cedula' => '12345678', 'telefono' => '3510001111', 'localidad' => 'Barrio Norte', 'numero_orden' => 1, 'zona_id' => 1, 'coordinador_id' => 1, 'movimiento_id' => 1],
            ['nombre_completo' => 'María González', 'cedula' => '23456789', 'telefono' => '3510002222', 'localidad' => 'Barrio Norte', 'numero_orden' => 2, 'zona_id' => 1, 'coordinador_id' => 1, 'movimiento_id' => 1],
            ['nombre_completo' => 'Pedro Martínez', 'cedula' => '34567890', 'telefono' => '3510003333', 'localidad' => 'Barrio Sur',   'numero_orden' => 3, 'zona_id' => 2, 'coordinador_id' => 2, 'movimiento_id' => 2],
            ['nombre_completo' => 'Laura Sánchez',  'cedula' => '45678901', 'telefono' => '3510004444', 'localidad' => 'Barrio Sur',   'numero_orden' => 4, 'zona_id' => 2, 'coordinador_id' => 2, 'movimiento_id' => 2],
            ['nombre_completo' => 'Diego Ramírez',  'cedula' => '56789012', 'telefono' => '3510005555', 'localidad' => 'Barrio Norte', 'numero_orden' => 5, 'zona_id' => 1, 'coordinador_id' => 1, 'movimiento_id' => 1],
        ];
        foreach ($votantes as $v) {
            Votante::create(array_merge($v, ['usuario_carga_id' => 1]));
        }
    }
}
