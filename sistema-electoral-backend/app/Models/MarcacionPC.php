<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class MarcacionPC extends Model
{
    protected $table = 'marcaciones_pc';
    protected $fillable = [
        'votante_id', 'fecha_hora_marcacion', 'usuario_pc_id',
        'premio_entregado', 'ip_address',
    ];
    protected $casts = [
        'fecha_hora_marcacion' => 'datetime',
        'premio_entregado'     => 'boolean',
    ];

    public function votante()  { return $this->belongsTo(Votante::class); }
    public function usuarioPc(){ return $this->belongsTo(User::class, 'usuario_pc_id'); }
}
