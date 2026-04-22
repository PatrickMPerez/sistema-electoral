<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVotanteRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id   = $this->route('votante')?->id;
        $mesa = $this->input('mesa', $this->route('votante')?->mesa);
        return [
            'nombres'          => 'sometimes|string|max:150',
            'apellidos'        => 'sometimes|string|max:150',
            'cedula'           => ['sometimes', 'string', 'max:20', Rule::unique('votantes', 'cedula')->ignore($id)],
            'telefono'         => 'sometimes|string|max:20',
            'departamento'     => 'sometimes|string|max:100',
            'distrito'         => 'sometimes|string|max:100',
            'seccional'        => 'sometimes|string|max:150',
            'mesa'             => 'sometimes|integer|min:1',
            'numero_orden'     => ['sometimes', 'integer', 'min:1',
                                   Rule::unique('votantes', 'numero_orden')->ignore($id)->where('mesa', $mesa)],
            'local_votacion_id'=> 'sometimes|nullable|exists:locales_votacion,id',
            'zona_id'          => 'sometimes|nullable|exists:zonas,id',
            'coordinador_id'   => 'nullable|exists:coordinadores,id',
            'jefe_zona_id'     => 'nullable|exists:jefes_zona,id',
            'movimiento_id'    => 'nullable|exists:movimientos,id',
            'localidad'        => 'nullable|string|max:255',
        ];
    }
}
