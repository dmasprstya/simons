<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLetterNumberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'classification_id' => [
                'required',
                Rule::exists('letter_classifications', 'id')
                    ->where('is_leaf', true)
                    ->where('is_active', true),
            ],
            'subject'     => 'required|string|max:255',
            'destination' => 'required|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'classification_id.required' => 'Klasifikasi surat wajib dipilih.',
            'classification_id.exists'   => 'Klasifikasi surat tidak valid, tidak aktif, atau bukan node daun.',
            'subject.required'           => 'Perihal surat wajib diisi.',
            'subject.max'                => 'Perihal surat maksimal 255 karakter.',
            'destination.required'       => 'Tujuan surat wajib diisi.',
            'destination.max'            => 'Tujuan surat maksimal 255 karakter.',
        ];
    }
}
