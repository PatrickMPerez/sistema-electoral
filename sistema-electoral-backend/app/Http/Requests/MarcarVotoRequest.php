<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class MarcarVotoRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'numero_orden' => 'required|integer|min:1',
            'cedula'       => 'required|string',
            'mesa'         => 'required|string|max:20',
            'observacion'  => 'nullable|string|max:500',
        ];
    }
}
