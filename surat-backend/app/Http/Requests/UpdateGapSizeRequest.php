<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGapSizeRequest extends FormRequest
{
    /**
     * Hanya admin yang diizinkan mengubah gap_size (dikontrol di middleware/policy level).
     * Di sini cukup pastikan user sudah authenticated.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Aturan validasi untuk pembaruan ukuran gap.
     * gap_size dibatasi 1–100 untuk menghindari blok nomor yang terlalu besar.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'gap_size' => 'required|integer|min:1|max:100',
        ];
    }

    /**
     * Pesan validasi dalam Bahasa Indonesia.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'gap_size.required' => 'Ukuran gap wajib diisi.',
            'gap_size.integer'  => 'Ukuran gap harus berupa bilangan bulat.',
            'gap_size.min'      => 'Ukuran gap minimal 1.',
            'gap_size.max'      => 'Ukuran gap maksimal 100.',
        ];
    }
}
