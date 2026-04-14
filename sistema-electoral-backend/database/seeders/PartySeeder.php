<?php

namespace Database\Seeders;

use App\Models\Party;
use Illuminate\Database\Seeder;

class PartySeeder extends Seeder
{
    public function run(): void
    {
        $parties = [
            ['name' => 'Partido Democrático', 'abbreviation' => 'PD',  'color' => '#1565C0'],
            ['name' => 'Partido Republicano',  'abbreviation' => 'PR',  'color' => '#C62828'],
            ['name' => 'Partido Verde',        'abbreviation' => 'PV',  'color' => '#2E7D32'],
            ['name' => 'Partido Liberal',      'abbreviation' => 'PL',  'color' => '#F9A825'],
        ];

        foreach ($parties as $party) {
            Party::create($party);
        }
    }
}
