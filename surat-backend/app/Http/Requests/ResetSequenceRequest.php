<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ResetSequenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Nomor awal baru setelah reset
            'next_start' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'next_start.required' => 'Nomor awal wajib diisi.',
            'next_start.integer'  => 'Nomor awal harus berupa bilangan bulat.',
            'next_start.min'      => 'Nomor awal minimal 1.',
        ];
    }
}
