<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class MarcarPCRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'cedula'           => 'required|string',
            'premio_entregado' => 'nullable|boolean',
        ];
    }
}
