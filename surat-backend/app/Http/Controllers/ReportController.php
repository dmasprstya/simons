<?php

namespace App\Http\Controllers;

use App\Models\LetterNumber;
use App\Services\AuditService;
use App\Services\ExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Inject ExportService via constructor.
     * ExportService saat ini masih stub — akan diimplementasi pada fase selanjutnya.
     */
    public function __construct(
        private readonly ExportService $exportService,
        private readonly AuditService $auditService,
    ) {}

    /**
     * Ringkasan statistik nomor surat — mengembalikan data yang sudah diagregasi
     * dalam format yang siap ditampilkan oleh frontend.
     *
     * Frontend mengirim parameter:
     *   - date_from:          batas awal tanggal surat  (alias issued_date_from)
     *   - date_to:            batas akhir tanggal surat (alias issued_date_to)
     *   - classification_id:  filter per klasifikasi
     *   - work_unit:          filter per unit kerja
     *   - status:             active | voided
     *
     * Response shape:
     * {
     *   total_letters: int,
     *   per_day: [{ date, count }],
     *   per_classification: [{ classification, count }],
     *   per_work_unit: [{ work_unit, count }],
     * }
     */
    public function summary(Request $request): JsonResponse
    {
        $driver = DB::connection()->getDriverName();
        $classificationExpr = $driver === 'sqlite'
            ? "(letter_classifications.code || ' — ' || letter_classifications.name)"
            : "CONCAT(letter_classifications.code, ' — ', letter_classifications.name)";

        // Terima kedua format parameter (date_from ATAU issued_date_from)
        // agar backward-compatible dan sesuai frontend
        $dateFrom = $request->input('date_from', $request->input('issued_date_from'));
        $dateTo   = $request->input('date_to', $request->input('issued_date_to'));

        $request->validate([
            'date_from'          => 'nullable|date',
            'date_to'            => 'nullable|date',
            'issued_date_from'   => 'nullable|date',
            'issued_date_to'     => 'nullable|date',
            'classification_id'  => 'nullable|integer',
            'classification_ids' => 'nullable|array',
            'classification_ids.*' => 'integer|exists:letter_classifications,id',
            'work_unit'          => 'nullable|string|max:255',
            'status'             => 'nullable|in:active,voided',
            'sifat_surat'        => 'nullable|string|max:100',
            'user_name'          => 'nullable|string|max:255',
        ]);

        // Merge classification_id into classification_ids for consistency
        $classIds = $request->input('classification_ids', []);
        if ($request->filled('classification_id')) {
            $classIds[] = (int) $request->classification_id;
        }
        $classIds = array_unique($classIds);

        // === Base query builder dengan filter ===
        $baseQuery = function () use ($request, $dateFrom, $dateTo, $classIds) {
            $q = DB::table('letter_numbers')
                ->join('users', 'letter_numbers.user_id', '=', 'users.id')
                ->join('letter_classifications', 'letter_numbers.classification_id', '=', 'letter_classifications.id');

            // Filter rentang tanggal
            if ($dateFrom) {
                $q->whereDate('letter_numbers.issued_date', '>=', $dateFrom);
            }
            if ($dateTo) {
                $q->whereDate('letter_numbers.issued_date', '<=', $dateTo);
            }

            // Filter berdasarkan klasifikasi (multiple)
            if (!empty($classIds)) {
                $q->whereIn('letter_numbers.classification_id', $classIds);
            }

            // Filter berdasarkan Unit Kerja
            if ($request->filled('work_unit')) {
                $q->where('users.work_unit', 'like', '%' . $request->work_unit . '%');
            }

            // Filter berdasarkan status
            if ($request->filled('status')) {
                $q->where('letter_numbers.status', $request->status);
            }

            // Filter berdasarkan sifat surat
            if ($request->filled('sifat_surat')) {
                $q->where('letter_numbers.sifat_surat', $request->sifat_surat);
            }

            // Filter berdasarkan Nama User
            if ($request->filled('user_name')) {
                $q->where('users.name', 'like', '%' . $request->user_name . '%');
            }

            return $q;
        };

        // 1) Total surat
        $totalLetters = $baseQuery()->count();

        // 2) Breakdown per hari — { date, count }
        $perDay = $baseQuery()
            ->select([
                'letter_numbers.issued_date as date',
                DB::raw('COUNT(*) as count'),
            ])
            ->groupBy('letter_numbers.issued_date')
            ->orderBy('letter_numbers.issued_date')
            ->get();

        // 3) Breakdown per klasifikasi — { classification, count }
        $perClassification = $baseQuery()
            ->select([
                DB::raw($classificationExpr . ' as classification'),
                DB::raw('COUNT(*) as count'),
            ])
            ->groupBy('letter_classifications.code', 'letter_classifications.name')
            ->orderByDesc(DB::raw('COUNT(*)'))
            ->get();

        // 4) Breakdown per Unit Kerja — { work_unit, count }
        $perWorkUnit = $baseQuery()
            ->select([
                DB::raw("IFNULL(users.work_unit, 'Tanpa Unit Kerja') as work_unit"),
                DB::raw('COUNT(*) as count'),
            ])
            ->groupBy('users.work_unit')
            ->orderByDesc(DB::raw('COUNT(*)'))
            ->get();

        return response()->json([
            'data'    => [
                'total_letters'      => $totalLetters,
                'per_day'            => $perDay,
                'per_classification' => $perClassification,
                'per_work_unit'       => $perWorkUnit,
            ],
            'message' => 'Ringkasan laporan berhasil diambil.',
        ]);
    }

    /**
     * Export data surat ke Excel / PDF.
     *
     * Stub response — ExportService belum diimplementasi.
     * Menerima parameter yang sama dengan summary().
     */
    public function export(Request $request): Response|JsonResponse
    {
        $request->validate([
            'date_from'          => 'nullable|date',
            'date_to'            => 'nullable|date',
            'classification_id'  => 'nullable|integer',
            'classification_ids' => 'nullable|array',
            'classification_ids.*' => 'integer|exists:letter_classifications,id',
            'work_unit'          => 'nullable|string|max:255',
            'status'             => 'nullable|in:active,voided',
            'sifat_surat'        => 'nullable|string|max:100',
            'user_name'          => 'nullable|string|max:255',
            'format'             => 'nullable|in:csv,pdf,json',
        ]);

        $filters = $request->only([
            'date_from',
            'date_to',
            'classification_id',
            'classification_ids',
            'work_unit',
            'status',
            'sifat_surat',
            'user_name',
        ]);
        $format = $request->input('format', 'csv');
        $rows = $this->exportService->getReportRows($filters);

        $this->auditService->log(
            action: 'report.exported',
            tableName: 'letter_numbers',
            recordId: 0,
            oldData: null,
            newData: [
                'format' => $format,
                'filters' => $filters,
                'total_rows' => $rows->count(),
            ]
        );

        if ($format === 'json') {
            return response()->json([
                'data' => $rows,
                'message' => 'Export laporan (JSON) berhasil dibuat.',
            ]);
        }

        if ($format === 'pdf') {
            $filename = $this->exportService->buildFilename('pdf');
            $pdfContent = $this->exportService->buildPdfContent($rows, $filters);

            return response($pdfContent, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Content-Length' => (string) strlen($pdfContent),
                'Cache-Control' => 'no-store, no-cache',
                'Pragma' => 'public',
            ]);
        }

        $filename = $this->exportService->buildFilename('csv');

        $csvHandle = fopen('php://temp', 'r+');
        fputcsv($csvHandle, [
            'Tanggal',
            'Nomor Format',
            'Nomor Urut',
            'Klasifikasi',
            'Perihal',
            'Tujuan',
            'Sifat Surat',
            'Pemohon',
            'Unit Kerja',
            'Status',
        ]);

        foreach ($rows as $row) {
            fputcsv($csvHandle, [
                $row->issued_date,
                $row->formatted_number ?: $row->number,
                $row->number,
                $row->classification,
                $row->subject,
                $row->destination,
                $row->sifat_surat,
                $row->requested_by,
                $row->work_unit,
                $row->status,
            ]);
        }

        rewind($csvHandle);
        $csv = stream_get_contents($csvHandle) ?: '';
        fclose($csvHandle);

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'no-store, no-cache',
        ]);
    }

    /**
     * Ambil daftar unik Unit Kerja untuk filter dropdown.
     */
    public function workUnits(): JsonResponse
    {
        $units = DB::table('users')
            ->whereNotNull('work_unit')
            ->where('work_unit', '!=', '')
            ->distinct()
            ->orderBy('work_unit')
            ->pluck('work_unit');

        return response()->json([
            'data' => $units,
            'message' => 'Daftar unit kerja berhasil diambil.',
        ]);
    }
}
