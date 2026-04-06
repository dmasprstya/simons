<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLetterClassificationRequest;
use App\Http\Requests\UpdateLetterClassificationRequest;
use App\Http\Resources\LetterClassificationResource;
use App\Models\LetterClassification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
     */
    public function store(StoreLetterClassificationRequest $request): JsonResponse
    {
        $classification = LetterClassification::create($request->validated());

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
