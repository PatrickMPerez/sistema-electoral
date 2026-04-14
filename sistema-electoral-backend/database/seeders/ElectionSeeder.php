<?php

namespace Database\Seeders;

use App\Models\Candidate;
use App\Models\Election;
use App\Models\Party;
use Illuminate\Database\Seeder;

class ElectionSeeder extends Seeder
{
    public function run(): void
    {
        $election = Election::create([
            'name'        => 'Elecciones Generales 2026',
            'description' => 'Elecciones presidenciales nacionales del año 2026.',
            'type'        => 'national',
            'start_date'  => now()->addDays(1),
            'end_date'    => now()->addDays(2),
            'status'      => 'pending',
        ]);

        $parties = Party::all()->keyBy('abbreviation');

        $candidates = [
            ['name' => 'Carlos Mendoza',   'party' => 'PD', 'bio' => 'Candidato del Partido Democrático.'],
            ['name' => 'Ana García',        'party' => 'PR', 'bio' => 'Candidata del Partido Republicano.'],
            ['name' => 'Luis Fernández',   'party' => 'PV', 'bio' => 'Candidato del Partido Verde.'],
            ['name' => 'María Rodríguez',  'party' => 'PL', 'bio' => 'Candidata del Partido Liberal.'],
        ];

        foreach ($candidates as $c) {
            Candidate::create([
                'election_id' => $election->id,
                'party_id'    => $parties[$c['party']]->id ?? null,
                'name'        => $c['name'],
                'bio'         => $c['bio'],
                'status'      => 'active',
            ]);
        }
    }
}
