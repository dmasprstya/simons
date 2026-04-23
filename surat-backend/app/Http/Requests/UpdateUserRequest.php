<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    /**
     * Hanya admin yang diizinkan mengupdate user (dikontrol di middleware/route).
     * Di sini cukup pastikan user sudah authenticated.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Aturan validasi untuk memperbarui data user.
     * Password tidak wajib saat update — hanya divalidasi jika dikirim.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        // Ambil ID dari route parameter — bisa bernama 'user' atau 'id'
        $id = $this->route('user') ?? $this->route('id');

        return [
            'name'     => 'required|string|max:100',
            'nip'      => "required|string|max:50|unique:users,nip,{$id}",
            // Ignore record saat ini agar email bisa disubmit sama
            'email'    => "required|email|unique:users,email,{$id}",
            // Password nullable saat update — hanya divalidasi jika ada isinya
            'password' => 'nullable|min:8',
            'work_unit' => 'required|string|max:100',
            'role'     => 'required|in:admin,user',
            'photo'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
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
            'name.required'  => 'Nama wajib diisi.',
            'name.max'       => 'Nama maksimal 100 karakter.',
            'nip.required'   => 'NIP wajib diisi.',
            'nip.max'        => 'NIP maksimal 50 karakter.',
            'nip.unique'     => 'NIP sudah digunakan oleh user lain.',
            'email.required' => 'Email wajib diisi.',
            'email.email'    => 'Format email tidak valid.',
            'email.unique'   => 'Email sudah digunakan oleh user lain.',
            'password.min'   => 'Password minimal 8 karakter.',
            'work_unit.required' => 'Unit Kerja wajib diisi.',
            'work_unit.max'      => 'Unit Kerja maksimal 100 karakter.',
            'role.required'  => 'Role wajib dipilih.',
            'role.in'        => 'Role harus admin atau user.',
            'photo.image'    => 'File foto harus berupa gambar.',
            'photo.mimes'    => 'Format foto: jpg, jpeg, png, atau webp.',
            'photo.max'      => 'Ukuran foto maksimal 2MB.',
        ];
    }
}
