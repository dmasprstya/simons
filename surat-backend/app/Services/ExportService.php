<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ExportService
{
    /**
     * Ambil data laporan detail berdasarkan filter.
     *
     * @param  array  $filters  Filter pencarian (tanggal, klasifikasi, status, dsb.)
     * @return \Illuminate\Support\Collection<int, object>
     */
    public function getReportRows(array $filters): Collection
    {
        $driver = DB::connection()->getDriverName();
        $classificationExpr = $driver === 'sqlite'
            ? "(letter_classifications.code || ' - ' || letter_classifications.name)"
            : "CONCAT(letter_classifications.code, ' - ', letter_classifications.name)";

        $query = DB::table('letter_numbers')
            ->join('users', 'letter_numbers.user_id', '=', 'users.id')
            ->join('letter_classifications', 'letter_numbers.classification_id', '=', 'letter_classifications.id')
            ->select([
                'letter_numbers.issued_date',
                'letter_numbers.formatted_number',
                'letter_numbers.number',
                DB::raw($classificationExpr . ' as classification'),
                'letter_numbers.subject',
                'letter_numbers.destination',
                'letter_numbers.sifat_surat',
                'users.name as requested_by',
                'users.work_unit',
                'letter_numbers.status',
            ]);

        if (!empty($filters['date_from'])) {
            $query->whereDate('letter_numbers.issued_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('letter_numbers.issued_date', '<=', $filters['date_to']);
        }

        // Backward compatibility: handle both classification_id and classification_ids
        $classIds = $filters['classification_ids'] ?? [];
        if (!empty($filters['classification_id'])) {
            $classIds[] = (int) $filters['classification_id'];
        }
        
        if (!empty($classIds)) {
            $query->whereIn('letter_numbers.classification_id', array_unique($classIds));
        }

        if (!empty($filters['work_unit'])) {
            $query->where('users.work_unit', 'like', '%' . $filters['work_unit'] . '%');
        }

        if (!empty($filters['status'])) {
            if ($filters['status'] === 'active_regular') {
                $query->where('letter_numbers.status', 'active')
                      ->where('letter_numbers.source', 'regular');
            } elseif ($filters['status'] === 'active_gap') {
                $query->where('letter_numbers.status', 'active')
                      ->where('letter_numbers.source', 'gap');
            }
        }

        if (!empty($filters['sifat_surat'])) {
            $query->where('letter_numbers.sifat_surat', $filters['sifat_surat']);
        }

        if (!empty($filters['user_name'])) {
            $query->where('users.name', 'like', '%' . $filters['user_name'] . '%');
        }

        return $query
            ->orderByDesc('letter_numbers.issued_date')
            ->orderByDesc('letter_numbers.id')
            ->get();
    }

    /**
     * Bangun nama file export berdasarkan format.
     *
     * @param  string  $format  Format export (csv/json/pdf)
     */
    public function buildFilename(string $format): string
    {
        return 'laporan-surat-' . now()->format('Ymd-His') . '.' . $format;
    }

    /**
     * Bangun konten PDF menggunakan DomPDF.
     *
     * @param  \Illuminate\Support\Collection<int, object>  $rows
     * @param  array<string, mixed>  $filters
     */
    public function buildPdfContent(Collection $rows, array $filters = []): string
    {
        $pdf = Pdf::loadView('exports.report-pdf', [
            'rows' => $rows,
            'filters' => $filters,
        ]);

        // A4 Landscape agar tabel muat lega
        return $pdf->setPaper('a4', 'landscape')->output();
    }
}
