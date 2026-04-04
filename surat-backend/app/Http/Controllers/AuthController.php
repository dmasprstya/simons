<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login user dan kembalikan Bearer token.
     *
     * Alur:
     * 1. Validasi input (email + password).
     * 2. Auth::attempt() — gagal → 401.
     * 3. Cek is_active — nonaktif → 403.
     * 4. Buat token Sanctum.
     * 5. Return 200 dengan token + data user.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        // Coba autentikasi; jika gagal kembalikan 401
        if (! Auth::attempt($credentials)) {
            return response()->json(['message' => 'Email atau password salah.'], 401);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Tolak login jika akun sudah dinonaktifkan
        if (! $user->is_active) {
            // Pastikan tidak ada session yang tersisa
            Auth::logout();

            return response()->json(['message' => 'Akun Anda dinonaktifkan.'], 403);
        }

        // Buat personal access token
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'data' => [
                'token' => $token,
                'user'  => new UserResource($user),
            ],
            'message' => 'Login berhasil.',
        ], 200);
    }

    /**
     * Logout user dengan menghapus token yang sedang digunakan.
     */
    public function logout(Request $request): JsonResponse
    {
        // Hapus hanya token yang dipakai pada request ini
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Berhasil logout.'], 200);
    }

    /**
     * Kembalikan data user yang sedang login.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new UserResource($request->user()),
        ], 200);
    }

    /**
     * Ganti password user yang sedang login.
     *
     * Alur:
     * 1. Validasi input (current_password, new_password confirmed, min 8).
     * 2. Verifikasi current_password dengan hash — gagal → 422.
     * 3. Update password.
     * 4. Revoke semua token KECUALI token yang sedang digunakan (agar sesi ini tetap valid).
     * 5. Return 200.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required'],
            'new_password'     => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();

        // Verifikasi password lama
        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Password lama salah.'], 422);
        }

        // Simpan password baru (model sudah mem-hash via cast 'hashed')
        $user->update(['password' => $request->new_password]);

        // Revoke semua token KECUALI yang sedang aktif sekarang
        $currentTokenId = $request->user()->currentAccessToken()->id;
        $user->tokens()->where('id', '!=', $currentTokenId)->delete();

        return response()->json(['message' => 'Password berhasil diubah.'], 200);
    }
}
