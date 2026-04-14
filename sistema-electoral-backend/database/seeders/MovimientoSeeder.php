<?php
namespace Database\Seeders;
use App\Models\Movimiento;
use Illuminate\Database\Seeder;

class MovimientoSeeder extends Seeder
{
    public function run(): void
    {
        Movimiento::create(['nombre_movimiento' => 'Frente Renovador', 'nombre_candidato' => 'Carlos Mendoza', 'lista' => '3', 'partido' => 'Frente de Todos']);
        Movimiento::create(['nombre_movimiento' => 'Juntos por el Cambio', 'nombre_candidato' => 'Ana García', 'lista' => '7', 'partido' => 'PRO']);
    }
}
