<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    /**
     * Hanya admin yang diizinkan membuat user baru (dikontrol di middleware/route).
     * Di sini cukup pastikan user sudah authenticated.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Aturan validasi untuk membuat user baru.
     * Password wajib saat create — berbeda dengan UpdateUserRequest.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name'     => 'required|string|max:100',
            'nip'      => 'required|string|max:50|unique:users,nip',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'division' => 'required|string|max:100',
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
            'name.required'     => 'Nama wajib diisi.',
            'name.max'          => 'Nama maksimal 100 karakter.',
            'nip.required'      => 'NIP wajib diisi.',
            'nip.max'           => 'NIP maksimal 50 karakter.',
            'nip.unique'        => 'NIP sudah digunakan oleh user lain.',
            'email.required'    => 'Email wajib diisi.',
            'email.email'       => 'Format email tidak valid.',
            'email.unique'      => 'Email sudah digunakan oleh user lain.',
            'password.required' => 'Password wajib diisi.',
            'password.min'      => 'Password minimal 8 karakter.',
            'division.required' => 'Divisi wajib diisi.',
            'division.max'      => 'Divisi maksimal 100 karakter.',
            'role.required'     => 'Role wajib dipilih.',
            'role.in'           => 'Role harus admin atau user.',
            'photo.image'       => 'File foto harus berupa gambar.',
            'photo.mimes'       => 'Format foto: jpg, jpeg, png, atau webp.',
            'photo.max'         => 'Ukuran foto maksimal 2MB.',
        ];
    }
}
