<?php

namespace App\Http\Requests;

class UpdateLetterClassificationRequest extends StoreLetterClassificationRequest
{
    /**
     * Override rules() dari StoreLetterClassificationRequest.
     *
     * Validasi uniqueness kode dikerjakan oleh withValidator() yang diwarisi dari parent.
     * withValidator() sudah menangani exclusion record diri sendiri via route parameter
     * ('classification' atau 'id'), jadi tidak perlu Rule::unique hardcoded di sini.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // Uniqueness kode dicek di withValidator() (scoped per parent_id, exclude self)
            'code'      => 'required|string',
            'name'      => 'required|string|max:255',
            'type'      => 'required|in:substantif,fasilitatif',
            'parent_id' => 'nullable|exists:letter_classifications,id',
            'level'     => 'required|integer|between:1,4',
        ];
    }
}
