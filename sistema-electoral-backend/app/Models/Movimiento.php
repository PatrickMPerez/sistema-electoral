<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Movimiento extends Model
{
    protected $table = 'movimientos';
    protected $fillable = ['nombre_movimiento', 'nombre_candidato', 'lista', 'partido', 'activo'];
    protected $casts = ['activo' => 'boolean'];
    public function votantes() { return $this->hasMany(Votante::class); }
}
