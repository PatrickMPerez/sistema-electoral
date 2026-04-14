<?php
namespace Database\Seeders;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create(['name' => 'Administrador', 'username' => 'admin',      'password' => Hash::make('password'), 'role' => 'administrador']);
        User::create(['name' => 'Jefe Zona Norte','username' => 'jefe1',     'password' => Hash::make('password'), 'role' => 'jefe_zona',    'zona_id' => 1, 'jefe_zona_id' => 1]);
        User::create(['name' => 'Coordinador 1',  'username' => 'coord1',    'password' => Hash::make('password'), 'role' => 'coordinador',  'zona_id' => 1, 'coordinador_id' => 1]);
        User::create(['name' => 'Vedor Zona Norte','username' => 'vedor1',   'password' => Hash::make('password'), 'role' => 'vedor',        'zona_id' => 1]);
    }
}
