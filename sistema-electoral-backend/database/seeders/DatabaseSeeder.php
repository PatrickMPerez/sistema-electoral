<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            MovimientoSeeder::class,
            JefeZonaSeeder::class,
            ZonaSeeder::class,
            CoordinadorSeeder::class,
            LocalVotacionSeeder::class,
            UserSeeder::class,
            VotanteSeeder::class,
        ]);
    }
}
