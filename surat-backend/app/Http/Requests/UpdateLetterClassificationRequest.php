<?php

namespace App\Http\Requests;

class UpdateLetterClassificationRequest extends StoreLetterClassificationRequest
{
    /**
     * Extend StoreLetterClassificationRequest — hanya override rules() untuk
     * mengecualikan record yang sedang diupdate dari validasi unique pada kolom code.
     * Logika withValidator() diwariskan dari parent tanpa perubahan.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        // Ambil ID dari route parameter — bisa bernama 'classification' atau 'id'
        $id = $this->route('classification') ?? $this->route('id');

        return [
            // Ignore record saat ini pada cek unique (format: unique:table,column,except_id)
            'code'      => "required|string|unique:letter_classifications,code,{$id}",
            'name'      => 'required|string|max:255',
            'type'      => 'required|in:substantif,fasilitatif',
            'parent_id' => 'nullable|exists:letter_classifications,id',
            'level'     => 'required|integer|between:1,4',
        ];
    }
}
