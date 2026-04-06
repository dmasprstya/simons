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
     * Ringkasan statistik nomor surat yang dikelompokkan per issued_date,
     * classification_id, dan division user pembuat.
     *
     * Filter yang tersedia:
     *   - issued_date_from:  batas awal tanggal surat
     *   - issued_date_to:    batas akhir tanggal surat
     *   - classification_id: filter per klasifikasi
     *   - status:            active | voided
     *
     * Menggunakan GROUP BY untuk efisiensi — tidak mem-load seluruh record.
     */
    public function summary(Request $request): JsonResponse
    {
        $request->validate([
            'issued_date_from'  => 'nullable|date',
            'issued_date_to'    => 'nullable|date|after_or_equal:issued_date_from',
            'classification_id' => 'nullable|integer|exists:letter_classifications,id',
            'status'            => 'nullable|in:active,voided',
        ]);

        $query = DB::table('letter_numbers')
            ->join('users', 'letter_numbers.user_id', '=', 'users.id')
            ->join('letter_classifications', 'letter_numbers.classification_id', '=', 'letter_classifications.id')
            ->select([
                'letter_numbers.issued_date',
                'letter_numbers.classification_id',
                'letter_classifications.name as classification_name',
                'letter_classifications.code as classification_code',
                'users.division',
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN letter_numbers.status = \'active\' THEN 1 ELSE 0 END) as total_active'),
                DB::raw('SUM(CASE WHEN letter_numbers.status = \'voided\' THEN 1 ELSE 0 END) as total_voided'),
            ])
            ->groupBy([
                'letter_numbers.issued_date',
                'letter_numbers.classification_id',
                'letter_classifications.name',
                'letter_classifications.code',
                'users.division',
            ])
            ->orderByDesc('letter_numbers.issued_date');

        // Filter rentang tanggal
        if ($request->filled('issued_date_from')) {
            $query->whereDate('letter_numbers.issued_date', '>=', $request->issued_date_from);
        }

        if ($request->filled('issued_date_to')) {
            $query->whereDate('letter_numbers.issued_date', '<=', $request->issued_date_to);
        }

        // Filter berdasarkan klasifikasi
        if ($request->filled('classification_id')) {
            $query->where('letter_numbers.classification_id', $request->classification_id);
        }

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $query->where('letter_numbers.status', $request->status);
        }

        $summary = $query->get();

        return response()->json([
            'data'    => $summary,
            'message' => 'Ringkasan laporan berhasil diambil.',
        ]);
    }

    /**
     * Export data surat ke Excel.
     *
     * Stub response — ExportService::exportExcel() belum diimplementasi.
     * Akan menghasilkan file Excel dan mengembalikan URL download saat
     * maatwebsite/excel telah diintegrasikan.
     *
     * Filter yang tersedia: sama dengan summary() (issued_date_from, to, classification_id, status).
     */
    public function export(Request $request): JsonResponse
    {
        $request->validate([
            'issued_date_from'  => 'nullable|date',
            'issued_date_to'    => 'nullable|date|after_or_equal:issued_date_from',
            'classification_id' => 'nullable|integer|exists:letter_classifications,id',
            'status'            => 'nullable|in:active,voided',
        ]);

        // Stub: ExportService::exportExcel() belum diimplementasi — kembalikan pesan placeholder
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
