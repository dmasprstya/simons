<?php

namespace App\Http\Requests;

use App\Models\LetterClassification;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreLetterClassificationRequest extends FormRequest
{
    /**
     * Hanya user yang sudah login yang diizinkan (admin dikontrol di middleware).
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Aturan validasi untuk membuat klasifikasi surat baru.
     * Hierarki maksimal 4 level: level 1 (root) sampai level 4.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'code'      => 'required|string|unique:letter_classifications,code',
            'name'      => 'required|string|max:255',
            'type'      => 'required|in:substantif,fasilitatif',
            'parent_id' => 'nullable|exists:letter_classifications,id',
            'level'     => 'required|integer|between:1,4',
            'is_leaf'   => 'sometimes|boolean',
        ];
    }

    /**
     * Validasi tambahan setelah rules() lolos:
     * 1. Jika parent_id diisi → validasi bahwa parent->level === level - 1
     *    (tidak boleh skip level hierarki)
     * 2. Level harus konsisten dengan parent (tidak boleh loncat level)
     *
     * @param Validator $validator
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $parentId = $this->input('parent_id');
            $level    = (int) $this->input('level');

            if ($parentId !== null) {
                /** @var LetterClassification|null $parent */
                $parent = LetterClassification::find($parentId);

                if ($parent === null) {
                    // Sudah ditangkap rules exists, tapi jaga-jaga
                    $validator->errors()->add('parent_id', 'Parent klasifikasi tidak ditemukan.');

                    return;
                }

                // Level harus tepat satu di bawah parent
                if ($parent->level !== $level - 1) {
                    $validator->errors()->add(
                        'parent_id',
                        "Parent harus berada di level " . ($level - 1) . " (ditemukan level {$parent->level})."
                    );
                }
            }

            // Level 1 tidak boleh punya parent
            if ($level === 1 && $parentId !== null) {
                $validator->errors()->add('parent_id', 'Klasifikasi level 1 (root) tidak boleh memiliki parent.');
            }
        });
    }

    /**
     * Pesan validasi dalam Bahasa Indonesia.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'code.required'      => 'Kode klasifikasi wajib diisi.',
            'code.unique'        => 'Kode klasifikasi sudah digunakan.',
            'name.required'      => 'Nama klasifikasi wajib diisi.',
            'name.max'           => 'Nama klasifikasi maksimal 255 karakter.',
            'type.required'      => 'Tipe klasifikasi wajib dipilih.',
            'type.in'            => 'Tipe klasifikasi harus substantif atau fasilitatif.',
            'parent_id.exists'   => 'Parent klasifikasi tidak ditemukan.',
            'level.required'     => 'Level klasifikasi wajib diisi.',
            'level.integer'      => 'Level klasifikasi harus berupa bilangan bulat.',
            'level.between'      => 'Level klasifikasi harus antara 1 sampai 4.',
        ];
    }
}
