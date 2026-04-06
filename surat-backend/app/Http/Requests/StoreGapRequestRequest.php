<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGapRequestRequest extends FormRequest
{
    /**
     * Hanya user yang sudah login yang boleh mengajukan permintaan nomor gap.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Aturan validasi untuk pengajuan permintaan nomor gap.
     * gap_date harus hari ini atau masa depan — tidak bisa minta gap untuk tanggal lampau.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'classification_id' => [
                'required',
                Rule::exists('letter_classifications', 'id')
                    ->where('is_leaf', true)
                    ->where('is_active', true),
            ],
            // after_or_equal:today mencegah pengajuan retroaktif
            'gap_date' => 'required|date|after_or_equal:today',
            'reason'   => 'required|string|min:10|max:1000',
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
            'classification_id.required'     => 'Klasifikasi surat wajib dipilih.',
            'classification_id.exists'        => 'Klasifikasi surat tidak valid, tidak aktif, atau bukan node daun.',
            'gap_date.required'              => 'Tanggal gap wajib diisi.',
            'gap_date.date'                  => 'Format tanggal gap tidak valid.',
            'gap_date.after_or_equal'        => 'Tanggal gap tidak boleh di masa lampau.',
            'reason.required'               => 'Alasan pengajuan gap wajib diisi.',
            'reason.min'                    => 'Alasan pengajuan gap minimal 10 karakter.',
            'reason.max'                    => 'Alasan pengajuan gap maksimal 1000 karakter.',
        ];
    }
}
