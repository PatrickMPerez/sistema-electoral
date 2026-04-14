<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class StoreVotanteRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nombres'          => 'required|string|max:150',
            'apellidos'        => 'required|string|max:150',
            'cedula'           => 'required|string|max:20|unique:votantes,cedula',
            'telefono'         => 'required|string|max:20',
            'departamento'     => 'required|string|max:100',
            'distrito'         => 'required|string|max:100',
            'seccional'        => 'required|string|max:150',
            'mesa'             => 'required|integer|min:1',
            'numero_orden'     => 'required|integer|min:1|unique:votantes,numero_orden',
            'local_votacion_id'=> 'required|exists:locales_votacion,id',
            'zona_id'          => 'required|exists:zonas,id',
            'coordinador_id'   => 'required|exists:coordinadores,id',
            'jefe_zona_id'     => 'nullable|exists:jefes_zona,id',
            'movimiento_id'    => 'nullable|exists:movimientos,id',
            'localidad'        => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'nombres.required'         => 'Los nombres son obligatorios.',
            'apellidos.required'       => 'Los apellidos son obligatorios.',
            'cedula.required'          => 'La cédula de identidad es obligatoria.',
            'cedula.unique'            => 'La cédula ya existe en el padrón.',
            'departamento.required'    => 'El departamento es obligatorio.',
            'distrito.required'        => 'El distrito es obligatorio.',
            'seccional.required'       => 'La seccional es obligatoria.',
            'mesa.required'            => 'El número de mesa es obligatorio.',
            'numero_orden.required'    => 'El número de orden es obligatorio.',
            'numero_orden.unique'      => 'El número de orden ya está asignado.',
            'local_votacion_id.required' => 'El local de votación es obligatorio.',
            'zona_id.required'         => 'La zona es obligatoria.',
            'coordinador_id.required'  => 'El coordinador es obligatorio.',
        ];
    }
}
