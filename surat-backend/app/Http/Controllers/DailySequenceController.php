<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateGapSizeRequest;
use App\Http\Resources\DailySequenceResource;
use App\Models\DailySequence;
use App\Services\NumberingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DailySequenceController extends Controller
{
    /**
     * Inject NumberingService untuk getOrCreateSequence.
     */
    public function __construct(
        private readonly NumberingService $numberingService,
    ) {}

    /**
     * Ambil atau buat sequence hari ini untuk klasifikasi tertentu.
     *
     * Endpoint: GET /sequences/today?classification_id=X
     *
     * Digunakan frontend untuk menampilkan status penomoran hari ini
     * sebelum pengguna menerbitkan nomor surat baru.
     * Response menyertakan computed block fields dari DailySequenceResource.
     */
    public function today(Request $request): JsonResponse
    {
        $request->validate([
            'classification_id' => 'required|integer|exists:letter_classifications,id',
        ]);

        // Lazy-create: buat sequence jika belum ada untuk hari ini
        $sequence = $this->numberingService->getOrCreateSequence(
            (int) $request->classification_id,
            today()
        );

        return response()->json([
            'data'    => new DailySequenceResource($sequence),
            'message' => 'Sequence hari ini berhasil diambil.',
        ]);
    }

    /**
     * Daftar semua sequence (admin only) dengan filter tanggal dan klasifikasi.
     *
     * Filter yang tersedia:
     *   - date_from:         batas awal tanggal sequence (format Y-m-d)
     *   - date_to:           batas akhir tanggal sequence (format Y-m-d)
     *   - classification_id: ID klasifikasi
     */
    public function index(Request $request): JsonResponse
    {
        $query = DailySequence::query();

        // Filter rentang tanggal sequence
        if ($request->filled('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }

        // Filter berdasarkan klasifikasi
        if ($request->filled('classification_id')) {
            $query->where('classification_id', $request->classification_id);
        }

        $sequences = $query->orderByDesc('date')->paginate(30);

        return response()->json([
            'data'    => DailySequenceResource::collection($sequences),
            'message' => 'Daftar sequence berhasil diambil.',
            'meta'    => $sequences->toArray()['meta'] ?? [
                'current_page' => $sequences->currentPage(),
                'last_page'    => $sequences->lastPage(),
                'per_page'     => $sequences->perPage(),
                'total'        => $sequences->total(),
            ],
        ]);
    }

    /**
     * Perbarui ukuran gap sequence untuk klasifikasi dan tanggal tertentu.
     *
     * Endpoint ini memperbarui gap_size pada row DailySequence yang sudah ada.
     * Gap baru berlaku untuk sequence yang dibuat mulai besok — artinya,
     * sequence hari ini tidak terpengaruh agar konsistensi nomor terjaga.
     *
     * Method menerima classification_id dan date (opsional, default besok)
     * sebagai target update. Jika tanggal tidak disediakan, update berlaku
     * untuk sequence besok.
     */
    public function updateGap(UpdateGapSizeRequest $request): JsonResponse
    {
        // Gap baru berlaku untuk sequence yang dibuat mulai besok
        $targetDate       = $request->filled('date') ? $request->date : today()->addDay()->toDateString();
        $classificationId = $request->filled('classification_id') ? (int) $request->classification_id : null;

        if ($classificationId) {
            // Update gap_size untuk sequence klasifikasi dan tanggal tertentu
            DailySequence::updateOrCreate(
                [
                    'date'              => $targetDate,
                    'classification_id' => $classificationId,
                ],
                [
                    'gap_size'    => $request->gap_size,
                    'last_number' => 0,
                    'next_start'  => config('numbering.default_start'),
                ]
            );

            return response()->json([
                'message' => "Gap size berhasil diperbarui menjadi {$request->gap_size} untuk sequence {$targetDate}.",
            ]);
        }

        // Jika tidak ada classification_id, update semua sequence besok
        DailySequence::where('date', $targetDate)
            ->update(['gap_size' => $request->gap_size]);

        return response()->json([
            'message' => "Gap size berhasil diperbarui menjadi {$request->gap_size} untuk semua sequence pada {$targetDate}.",
        ]);
    }
}
