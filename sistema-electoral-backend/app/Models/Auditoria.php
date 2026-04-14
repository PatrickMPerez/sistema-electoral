<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Auditoria extends Model
{
    public $timestamps = false;
    protected $table = 'auditoria';
    protected $fillable = [
        'tabla_afectada', 'registro_id', 'accion',
        'datos_anteriores', 'datos_nuevos', 'usuario_id', 'ip_address',
    ];
    protected $casts = [
        'datos_anteriores' => 'array',
        'datos_nuevos'     => 'array',
    ];

    public function usuario() { return $this->belongsTo(User::class, 'usuario_id'); }

    public static function registrar(string $tabla, int $registroId, string $accion, ?array $antes, ?array $despues, ?int $userId, ?string $ip = null): void
    {
        static::create([
            'tabla_afectada'   => $tabla,
            'registro_id'      => $registroId,
            'accion'           => $accion,
            'datos_anteriores' => $antes,
            'datos_nuevos'     => $despues,
            'usuario_id'       => $userId,
            'ip_address'       => $ip,
        ]);
    }
}
