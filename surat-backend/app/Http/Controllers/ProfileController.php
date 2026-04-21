<?php
namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function __construct(
        private readonly AuditService $auditService
    ) {}

    /**
     * Tampilkan profil user yang sedang login.
     */
    public function show(): JsonResponse
    {
        return response()->json([
            'data'    => new UserResource(Auth::user()),
            'message' => 'Profil berhasil diambil.',
        ]);
    }

    /**
     * Update nama dan divisi user yang sedang login.
     * Email, role, dan NIP tidak bisa diubah sendiri.
     */
    public function update(Request $request): JsonResponse
    {
        $user = Auth::user();

        $request->validate([
            'name'     => 'required|string|max:100',
            'division' => 'required|string|max:100',
            'photo'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $validated = $request->only('name', 'division');

        // Ganti foto profil jika ada file baru
        if ($request->hasFile('photo')) {
            if ($user->photo_path) {
                Storage::disk('public')->delete($user->photo_path);
            }
            $validated['photo_path'] = $request->file('photo')->store('photos/users', 'public');
        }

        $oldData = $user->getRawOriginal();
        $user->update($validated);

        $this->auditService->log(
            action:    'profile.update',
            tableName: 'users',
            recordId:  $user->id,
            oldData:   $oldData,
            newData:   $user->fresh()->toArray(),
        );

        return response()->json([
            'data'    => new UserResource($user->fresh()),
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
            'password'         => 'required|string|min:8|confirmed',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Password lama tidak sesuai.',
            ], 422);
        }

        $oldData = $user->getRawOriginal();
        $user->update([
            'password' => $request->password, // hashed via cast
        ]);

        $this->auditService->log(
            action:    'profile.change_password',
            tableName: 'users',
            recordId:  $user->id,
            oldData:   ['password' => '***'],
            newData:   ['password' => '***'],
        );

        return response()->json([
            'message' => 'Password berhasil diubah.',
        ]);
    }

    /**
     * Upload foto profil (endpoint terpisah).
     */
    public function uploadPhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->photo_path) {
            Storage::disk('public')->delete($user->photo_path);
        }

        $path = $request->file('photo')->store('photos/users', 'public');
        
        $oldData = $user->getRawOriginal();
        $user->update(['photo_path' => $path]);

        $this->auditService->log(
            action:    'profile.photo_upload',
            tableName: 'users',
            recordId:  $user->id,
            oldData:   $oldData,
            newData:   $user->fresh()->toArray(),
        );

        return response()->json([
            'data'    => new UserResource($user->fresh()),
            'message' => 'Foto profil berhasil diperbarui.',
        ]);
    }

    /**
     * Hapus foto profil (set ke null).
     */
    public function deletePhoto(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->photo_path) {
            Storage::disk('public')->delete($user->photo_path);
        }

        $oldData = $user->getRawOriginal();
        $user->update(['photo_path' => null]);

        $this->auditService->log(
            action:    'profile.photo_delete',
            tableName: 'users',
            recordId:  $user->id,
            oldData:   $oldData,
            newData:   $user->fresh()->toArray(),
        );

        return response()->json([
            'data'    => new UserResource($user->fresh()),
            'message' => 'Foto profil berhasil dihapus.',
        ]);
    }
}

