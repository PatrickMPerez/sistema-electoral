<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Veedor extends Model
{
    protected $table = 'veedores';
    protected $fillable = ['nombre_completo', 'cedula', 'telefono', 'mesa', 'activo'];
    protected $casts = ['activo' => 'boolean'];

    public function usuario() { return $this->hasOne(User::class); }
}
