<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateGapSizeRequest;
use App\Services\AuditService;
use App\Services\NumberingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DailySequenceController extends Controller
{
    public function __construct(
        private readonly NumberingService $numberingService,
        private readonly AuditService     $auditService,
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
        // Trigger rollover zona gap jika hari telah berganti tanpa nomor baru diterbitkan
        $this->numberingService->ensureDayIsCurrent();

        return response()->json([
            'data'    => $this->numberingService->getSequenceInfo(),
            'message' => 'Info sequence global berhasil diambil.',
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
        // Trigger rollover zona gap jika hari telah berganti
        $this->numberingService->ensureDayIsCurrent();

        return response()->json([
            'data'    => $this->numberingService->getSequenceInfo(),
            'message' => 'Info sequence global berhasil diambil.',
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
        $this->numberingService->updateGapSize($request->gap_size);
        return response()->json([
            'data'    => $this->numberingService->getSequenceInfo(),
            'message' => 'Gap size berhasil diperbarui.',
        ]);
    }

}
