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
     *   - division:           filter per divisi
     *   - status:             active | voided
     *
     * Response shape:
     * {
     *   total_letters: int,
     *   per_day: [{ date, count }],
     *   per_classification: [{ classification, count }],
     *   per_division: [{ division, count }],
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
            'date_from'         => 'nullable|date',
            'date_to'           => 'nullable|date',
            'issued_date_from'  => 'nullable|date',
            'issued_date_to'    => 'nullable|date',
            'classification_id' => 'nullable|integer|exists:letter_classifications,id',
            'division'          => 'nullable|string|max:255',
            'status'            => 'nullable|in:active,voided',
        ]);

        // === Base query builder dengan filter ===
        $baseQuery = function () use ($request, $dateFrom, $dateTo) {
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

            // Filter berdasarkan klasifikasi
            if ($request->filled('classification_id')) {
                $q->where('letter_numbers.classification_id', $request->classification_id);
            }

            // Filter berdasarkan divisi
            if ($request->filled('division')) {
                $q->where('users.division', 'like', '%' . $request->division . '%');
            }

            // Filter berdasarkan status
            if ($request->filled('status')) {
                $q->where('letter_numbers.status', $request->status);
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

        // 4) Breakdown per divisi — { division, count }
        $perDivision = $baseQuery()
            ->select([
                DB::raw("IFNULL(users.division, 'Tanpa Divisi') as division"),
                DB::raw('COUNT(*) as count'),
            ])
            ->groupBy('users.division')
            ->orderByDesc(DB::raw('COUNT(*)'))
            ->get();

        return response()->json([
            'data'    => [
                'total_letters'      => $totalLetters,
                'per_day'            => $perDay,
                'per_classification' => $perClassification,
                'per_division'       => $perDivision,
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
            'date_from'         => 'nullable|date',
            'date_to'           => 'nullable|date',
            'classification_id' => 'nullable|integer|exists:letter_classifications,id',
            'division'          => 'nullable|string|max:255',
            'status'            => 'nullable|in:active,voided',
            'format'            => 'nullable|in:csv,pdf,json',
        ]);
        $filters = $request->only([
            'date_from',
            'date_to',
            'classification_id',
            'division',
            'status',
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
            'Divisi',
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
                $row->division,
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
}
