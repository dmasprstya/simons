<?php
namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    /**
     * Tampilkan profil user yang sedang login.
     */
    public function show(): JsonResponse
    {
        return response()->json([
            'data'    => new \App\Http\Resources\UserResource(Auth::user()),
            'message' => 'Profil berhasil diambil.',
        ]);
    }

    /**
     * Update nama dan divisi user yang sedang login.
     * Email dan role tidak bisa diubah sendiri.
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'name'     => 'required|string|max:100',
            'division' => 'required|string|max:100',
        ]);

        Auth::user()->update($request->only('name', 'division'));

        return response()->json([
            'data'    => new \App\Http\Resources\UserResource(Auth::user()->fresh()),
            'message' => 'Profil berhasil diperbarui.',
        ]);
    }

    /**
     * Ganti password user yang sedang login.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:8|confirmed',
        ]);

        if (! Hash::check($request->current_password, Auth::user()->password)) {
            return response()->json([
                'message' => 'Password lama tidak sesuai.',
            ], 422);
        }

        Auth::user()->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'message' => 'Password berhasil diubah.',
        ]);
    }

    /**
     * Upload foto profil.
     * Menerima Base64 string (JPG/PNG, maks ~2.7MB setelah encoding).
     * Validasi tipe MIME dari Base64 header sebelum simpan.
     */
    public function uploadPhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => 'required|string',
            // Validasi format Base64 dan tipe file dilakukan manual di bawah
        ]);

        $base64 = $request->photo;

        // Pastikan format Base64 valid: data:image/jpeg;base64,... atau data:image/png;base64,...
        if (! preg_match('/^data:image\/(jpeg|png);base64,/', $base64, $matches)) {
            return response()->json([
                'message' => 'Format foto tidak valid. Hanya JPG dan PNG yang diizinkan.',
            ], 422);
        }

        // Hitung ukuran file dari Base64 (estimasi: panjang Base64 * 0.75)
        $base64Data   = substr($base64, strpos($base64, ',') + 1);
        $sizeInBytes  = (int) (strlen($base64Data) * 0.75);
        $maxBytes     = 2 * 1024 * 1024; // 2MB

        if ($sizeInBytes > $maxBytes) {
            return response()->json([
                'message' => 'Ukuran foto maksimal 2MB.',
            ], 422);
        }

        Auth::user()->update(['profile_photo' => $base64]);

        return response()->json([
            'data'    => ['profile_photo' => $base64],
            'message' => 'Foto profil berhasil diperbarui.',
        ]);
    }

    /**
     * Hapus foto profil (set ke null).
     */
    public function deletePhoto(): JsonResponse
    {
        Auth::user()->update(['profile_photo' => null]);

        return response()->json([
            'message' => 'Foto profil berhasil dihapus.',
        ]);
    }
}
