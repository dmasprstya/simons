<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Services\AuditService;

class UserController extends Controller
{
    public function __construct(
        private readonly AuditService $auditService
    ) {}

    /**
     * Daftar semua user dengan filter role dan work_unit.
     *
     * Hanya admin yang dapat mengakses endpoint ini (dijamin via middleware role:admin).
     * Hasil di-paginate 20 per halaman.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        // Filter pencarian teks — nama, email, atau NIP
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%");
            });
        }

        // Filter berdasarkan role jika disediakan
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Filter berdasarkan status aktif (is_active = 1 atau 0)
        if ($request->has('is_active') && $request->input('is_active') !== '') {
            $query->where('is_active', (bool) $request->is_active);
        }

        // Filter berdasarkan work_unit jika disediakan
        if ($request->filled('work_unit')) {
            $query->where('work_unit', 'like', '%' . $request->work_unit . '%');
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

        $validated['plain_password'] = $validated['password'];

        // Hash password sebelum simpan ke database
        $validated['password'] = bcrypt($validated['password']);

        // Simpan foto profil ke storage public jika diunggah
        if ($request->hasFile('photo')) {
            $validated['photo_path'] = $request->file('photo')->store('photos/users', 'public');
        }
        unset($validated['photo']);

        $user = User::create($validated);

        $this->auditService->log(
            action:    'user.create',
            tableName: 'users',
            recordId:  $user->id,
            newData:   $user->toArray(),
        );

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
            $validated['plain_password'] = $validated['password'];
            $validated['password'] = bcrypt($validated['password']);
        }

        // Ganti foto profil jika ada file baru — hapus file lama terlebih dahulu
        if ($request->hasFile('photo')) {
            if ($user->photo_path) {
                Storage::disk('public')->delete($user->photo_path);
            }
            $validated['photo_path'] = $request->file('photo')->store('photos/users', 'public');
        }
        unset($validated['photo']);

        $oldData = $user->getRawOriginal();
        $user->update($validated);

        $this->auditService->log(
            action:    'user.update',
            tableName: 'users',
            recordId:  $user->id,
            oldData:   $oldData,
            newData:   $user->fresh()->toArray(),
        );

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

        $oldData = $user->getRawOriginal();
        $user->update(['is_active' => ! $user->is_active]);

        $this->auditService->log(
            action:    'user.toggle_active',
            tableName: 'users',
            recordId:  $user->id,
            oldData:   $oldData,
            newData:   $user->fresh()->toArray(),
        );

        $statusLabel = $user->fresh()->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json([
            'data'    => new UserResource($user->fresh()),
            'message' => "Akun user berhasil {$statusLabel}.",
        ]);
    }

    /**
     * Ganti password user oleh admin.
     */
    public function changePassword(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::findOrFail($id);

        $user->update([
            'password' => bcrypt($request->password),
            'plain_password' => $request->password,
        ]);

        $this->auditService->log(
            action:    'user.change_password',
            tableName: 'users',
            recordId:  $user->id,
            oldData:   ['password' => '********'],
            newData:   ['password' => '********'],
        );

        return response()->json([
            'data'    => new UserResource($user->fresh()),
            'message' => 'Password user berhasil diubah.',
        ]);
    }

    /**
     * Hapus user dari sistem.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Cegah admin menghapus diri sendiri
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'Tidak dapat menghapus diri sendiri.',
            ], 422);
        }

        $oldData = $user->getRawOriginal();

        return DB::transaction(function () use ($user, $oldData) {
            // Hapus foto profil jika ada
            if ($user->photo_path) {
                Storage::disk('public')->delete($user->photo_path);
            }

            $user->delete();

            $this->auditService->log(
                action:    'user.delete',
                tableName: 'users',
                recordId:  $user->id,
                oldData:   $oldData,
            );

            return response()->json([
                'data'    => null,
                'message' => 'User berhasil dihapus.',
            ]);
        });
    }

    /**
     * Import users from CSV.
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        
        // Detect separator
        $separator = ',';
        $firstLine = fgets($handle);
        if ($firstLine && strpos($firstLine, ';') !== false && strpos($firstLine, ',') === false) {
            $separator = ';';
        }
        rewind($handle);

        // Read header
        $header = fgetcsv($handle, 1000, $separator);
        
        if ($header) {
            $header = array_map(function($h) {
                return trim(strtolower($h));
            }, $header);
        }

        $expectedHeaders = ['name', 'nip', 'email', 'password', 'work_unit', 'role'];
        if (!$header || array_diff($expectedHeaders, $header)) {
            fclose($handle);
            return response()->json([
                'message' => 'Format header CSV tidak valid. Harus mengandung kolom: name, nip, email, password, work_unit, role.',
            ], 422);
        }

        $rows = [];
        while (($data = fgetcsv($handle, 1000, $separator)) !== false) {
            if (count($data) < count($header)) {
                continue;
            }
            $row = array_combine($header, array_map('trim', $data));
            $rows[] = $row;
        }
        fclose($handle);

        if (empty($rows)) {
            return response()->json([
                'message' => 'File CSV kosong atau tidak ada data untuk di-import.',
            ], 422);
        }

        // Validate all rows
        $errors = [];
        foreach ($rows as $index => $row) {
            $rowNum = $index + 2; // header is row 1
            $validator = \Illuminate\Support\Facades\Validator::make($row, [
                'name'      => 'required|string|max:100',
                'nip'       => 'required|string|size:18|unique:users,nip',
                'email'     => 'required|email|unique:users,email',
                'password'  => 'required|min:8',
                'work_unit' => 'required|string|max:100',
                'role'      => 'required|in:admin,user',
            ]);

            if ($validator->fails()) {
                $errors[] = [
                    'row' => $rowNum,
                    'errors' => $validator->errors()->all()
                ];
            }
        }

        if (!empty($errors)) {
            return response()->json([
                'message' => 'Proses import dibatalkan karena terdapat data yang tidak valid.',
                'errors' => $errors
            ], 422);
        }

        $importedCount = 0;
        DB::transaction(function () use ($rows, &$importedCount) {
            foreach ($rows as $row) {
                $user = User::create([
                    'name'           => $row['name'],
                    'nip'            => $row['nip'],
                    'email'          => $row['email'],
                    'password'       => bcrypt($row['password']),
                    'plain_password' => $row['password'],
                    'work_unit'      => $row['work_unit'],
                    'role'           => $row['role'],
                    'is_active'      => true,
                ]);

                $this->auditService->log(
                    action:    'user.create',
                    tableName: 'users',
                    recordId:  $user->id,
                    newData:   $user->toArray(),
                );

                $importedCount++;
            }
        });

        return response()->json([
            'message' => "Berhasil mengimport {$importedCount} user.",
            'data'    => null,
        ]);
    }
}
