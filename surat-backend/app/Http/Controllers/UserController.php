<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Daftar semua user dengan filter role dan division.
     *
     * Hanya admin yang dapat mengakses endpoint ini (dijamin via middleware role:admin).
     * Hasil di-paginate 20 per halaman.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        // Filter berdasarkan role jika disediakan
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Filter berdasarkan division jika disediakan
        if ($request->filled('division')) {
            $query->where('division', $request->division);
        }

        $users = $query->orderBy('name')->paginate(20);

        return response()->json([
            'data'    => UserResource::collection($users),
            'message' => 'Daftar user berhasil diambil.',
            'meta'    => $users->toArray()['meta'] ?? [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'per_page'     => $users->perPage(),
                'total'        => $users->total(),
            ],
        ]);
    }

    /**
     * Buat user baru.
     *
     * Password di-hash via bcrypt() sebelum disimpan.
     * Model User tidak menggunakan cast 'hashed' untuk password karena
     * hashing dilakukan secara eksplisit di controller sesuai konvensi proyek.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Hash password sebelum simpan ke database
        $validated['password'] = bcrypt($validated['password']);

        $user = User::create($validated);

        return response()->json([
            'data'    => new UserResource($user),
            'message' => 'User berhasil dibuat.',
        ], 201);
    }

    /**
     * Tampilkan detail user berdasarkan ID.
     */
    public function show(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        return response()->json([
            'data'    => new UserResource($user),
            'message' => 'Detail user berhasil diambil.',
        ]);
    }

    /**
     * Perbarui data user.
     *
     * Password hanya diupdate jika field password disertakan dalam request.
     */
    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user      = User::findOrFail($id);
        $validated = $request->validated();

        // Hash password baru jika disertakan dalam update
        if (isset($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'data'    => new UserResource($user->fresh()),
            'message' => 'User berhasil diperbarui.',
        ]);
    }

    /**
     * Toggle status aktif/nonaktif user.
     *
     * Admin tidak dapat menonaktifkan dirinya sendiri untuk mencegah
     * lockout akses admin. Guard ini diterapkan di sini karena menyentuh
     * logika bisnis, bukan sekadar otorisasi request.
     */
    public function toggleActive(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Cegah admin menonaktifkan diri sendiri
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'Tidak dapat mengubah status diri sendiri.',
            ], 422);
        }

        $user->update(['is_active' => ! $user->is_active]);

        $statusLabel = $user->fresh()->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json([
            'data'    => new UserResource($user->fresh()),
            'message' => "Akun user berhasil {$statusLabel}.",
        ]);
    }
}
