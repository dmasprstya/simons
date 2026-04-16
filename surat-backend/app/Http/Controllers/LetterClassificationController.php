<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLetterClassificationRequest;
use App\Http\Requests\UpdateLetterClassificationRequest;
use App\Http\Resources\LetterClassificationResource;
use App\Models\LetterClassification;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LetterClassificationController extends Controller
{
    /**
     * Daftar klasifikasi surat tingkat atas (parent_id = null).
     *
     * Difilter berdasarkan type jika disediakan.
     * Di-paginate 50 per halaman karena data klasifikasi relatif statis.
     */
    public function index(Request $request): JsonResponse
    {
        $query = LetterClassification::whereNull('parent_id');

        // Filter berdasarkan type (incoming/outgoing/memo)
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $classifications = $query->orderBy('code')->paginate(50);

        return response()->json([
            'data'    => LetterClassificationResource::collection($classifications),
            'message' => 'Daftar klasifikasi berhasil diambil.',
            'meta'    => $classifications->toArray()['meta'] ?? [
                'current_page' => $classifications->currentPage(),
                'last_page'    => $classifications->lastPage(),
                'per_page'     => $classifications->perPage(),
                'total'        => $classifications->total(),
            ],
        ]);
    }

    /**
     * Kembalikan semua child klasifikasi yang aktif dari parent tertentu.
     *
     * Tidak di-paginate karena children biasanya jumlahnya sedikit dan
     * dibutuhkan seluruhnya untuk dropdown/select di frontend.
     */
    public function children(int $id): JsonResponse
    {
        // Pastikan parent ada
        $parent = LetterClassification::findOrFail($id);

        $children = LetterClassification::where('parent_id', $id)
            ->where('is_active', true)
            ->orderBy('code')
            ->get();

        return response()->json([
            'data'    => LetterClassificationResource::collection($children),
            'message' => "Children dari klasifikasi #{$parent->id} berhasil diambil.",
        ]);
    }

    /**
     * Cari klasifikasi berdasarkan nama atau kode secara full-text di semua level.
     *
     * Hanya mengembalikan klasifikasi aktif (is_active = true).
     * Digunakan oleh frontend search box di ClassificationPicker.
     * Setiap hasil menyertakan chain ancestor agar frontend bisa menyinkronkan
     * dropdown level 1–4 secara otomatis setelah user memilih.
     */
    public function search(Request $request): JsonResponse
    {
        $term = $request->query('q', '');

        if (strlen(trim($term)) < 2) {
            return response()->json(['data' => [], 'message' => 'Masukkan minimal 2 karakter.']);
        }

        $results = LetterClassification::where('is_active', true)
            ->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('code', 'like', "%{$term}%");
            })
            ->orderBy('code')
            ->limit(20)
            ->get();

        // Sertakan chain ancestor (level 1 → this) agar frontend bisa resolve hierarki
        $mapped = $results->map(function (LetterClassification $item) {
            $ancestors = [];
            $current   = $item;

            // Telusuri ke atas sampai root
            while ($current->parent_id !== null) {
                $current = LetterClassification::find($current->parent_id);
                if (! $current) break;
                array_unshift($ancestors, ['id' => $current->id, 'name' => $current->name, 'code' => $current->code, 'level' => $current->level]);
            }

            return [
                'id'        => $item->id,
                'code'      => $item->code,
                'name'      => $item->name,
                'level'     => $item->level,
                'is_leaf'   => $item->is_leaf,
                'ancestors' => $ancestors,
            ];
        });

        return response()->json(['data' => $mapped, 'message' => 'Hasil pencarian klasifikasi.']);
    }

    /**
     * Tampilkan detail klasifikasi beserta relasi parent dan children-nya.
     */
    public function show(int $id): JsonResponse
    {
        $classification = LetterClassification::with(['parent', 'children'])->findOrFail($id);

        return response()->json([
            'data'    => new LetterClassificationResource($classification),
            'message' => 'Detail klasifikasi berhasil diambil.',
        ]);
    }

    /**
     * Buat klasifikasi baru.
     *
     * Logika is_leaf:
     * - Node baru selalu is_leaf = true (belum punya anak)
     * - Jika punya parent_id, parent tersebut harus di-update menjadi is_leaf = false
     *   karena kini punya minimal satu anak.
     */
    public function store(
        StoreLetterClassificationRequest $request,
        AuditService $audit
    ): JsonResponse {
        $validated = $request->validated();

        // Node baru belum punya anak → selalu leaf
        $validated['is_leaf'] = true;

        $classification = DB::transaction(function () use ($validated, $audit): LetterClassification {
            $node = LetterClassification::create($validated);

            // Jika punya parent, parent bukan leaf lagi
            if ($node->parent_id !== null) {
                LetterClassification::where('id', $node->parent_id)
                    ->update(['is_leaf' => false]);
            }

            $audit->log(
                'classification.created',
                'letter_classifications',
                $node->id,
                null,
                $node->toArray()
            );

            return $node;
        });

        return response()->json([
            'data'    => new LetterClassificationResource($classification),
            'message' => 'Klasifikasi berhasil dibuat.',
        ], 201);
    }

    /**
     * Perbarui data klasifikasi.
     */
    public function update(UpdateLetterClassificationRequest $request, int $id): JsonResponse
    {
        $classification = LetterClassification::findOrFail($id);
        $classification->update($request->validated());

        return response()->json([
            'data'    => new LetterClassificationResource($classification->fresh()),
            'message' => 'Klasifikasi berhasil diperbarui.',
        ]);
    }

    /**
     * Toggle status aktif/nonaktif klasifikasi.
     *
     * Menonaktifkan parent tidak otomatis menonaktifkan children —
     * ini ditangani di level aplikasi/seeder, bukan di endpoint ini.
     */
    public function toggleActive(int $id): JsonResponse
    {
        $classification = LetterClassification::findOrFail($id);
        $classification->update(['is_active' => ! $classification->is_active]);

        $statusLabel = $classification->fresh()->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json([
            'data'    => new LetterClassificationResource($classification->fresh()),
            'message' => "Klasifikasi berhasil {$statusLabel}.",
        ]);
    }
}
