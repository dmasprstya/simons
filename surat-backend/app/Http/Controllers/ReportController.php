<?php

namespace App\Http\Controllers;

use App\Models\LetterNumber;
use App\Services\ExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ReportController extends Controller
{
    /**
     * Inject ExportService via constructor.
     * ExportService saat ini masih stub — akan diimplementasi pada fase selanjutnya.
     */
    public function __construct(
        private readonly ExportService $exportService,
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
                DB::raw("(letter_classifications.code || ' — ' || letter_classifications.name) as classification"),
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
    public function export(Request $request): JsonResponse
    {
        $request->validate([
            'date_from'         => 'nullable|date',
            'date_to'           => 'nullable|date',
            'classification_id' => 'nullable|integer|exists:letter_classifications,id',
            'division'          => 'nullable|string|max:255',
            'status'            => 'nullable|in:active,voided',
            'format'            => 'nullable|in:excel,pdf',
        ]);

        // Stub: ExportService belum diimplementasi — kembalikan pesan placeholder
        // TODO: Uncomment saat ExportService sudah diimplementasi dengan maatwebsite/excel
        // $path = $this->exportService->exportExcel($request->all());
        // return response()->json([
        //     'data'    => ['url' => Storage::url($path)],
        //     'message' => 'Export berhasil.',
        // ]);

        return response()->json([
            'data'    => ['url' => null],
            'message' => 'Fitur export belum tersedia. ExportService masih dalam tahap implementasi.',
        ]);
    }
}
