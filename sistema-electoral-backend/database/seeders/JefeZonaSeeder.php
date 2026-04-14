<?php
namespace Database\Seeders;
use App\Models\JefeZona;
use Illuminate\Database\Seeder;

class JefeZonaSeeder extends Seeder
{
    public function run(): void
    {
        JefeZona::create(['nombre_completo' => 'Roberto Silva', 'cedula' => '11111111', 'telefono' => '3511234567']);
        JefeZona::create(['nombre_completo' => 'Marta López',   'cedula' => '22222222', 'telefono' => '3519876543']);
    }
}
