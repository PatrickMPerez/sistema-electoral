<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class StoreUsuarioRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'           => 'required|string|max:255',
            'username'       => 'required|string|max:50|unique:users,username',
            'password'       => 'required|string|min:6|confirmed',
            'role'           => 'required|in:administrador,jefe_zona,coordinador,vedor',
            'zona_id'        => 'nullable|exists:zonas,id',
            'jefe_zona_id'   => 'nullable|exists:jefes_zona,id',
            'coordinador_id' => 'nullable|exists:coordinadores,id',
            'veedor_id'      => 'nullable|exists:veedores,id',
            'mesa'           => 'nullable|string|max:20',
        ];
    }
}
