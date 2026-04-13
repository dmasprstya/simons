<?php

namespace App\Services;

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
                'users.division',
                'letter_numbers.status',
            ]);

        if (!empty($filters['date_from'])) {
            $query->whereDate('letter_numbers.issued_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('letter_numbers.issued_date', '<=', $filters['date_to']);
        }

        if (!empty($filters['classification_id'])) {
            $query->where('letter_numbers.classification_id', (int) $filters['classification_id']);
        }

        if (!empty($filters['division'])) {
            $query->where('users.division', 'like', '%' . $filters['division'] . '%');
        }

        if (!empty($filters['status'])) {
            $query->where('letter_numbers.status', $filters['status']);
        }

        return $query
            ->orderByDesc('letter_numbers.issued_date')
            ->orderByDesc('letter_numbers.id')
            ->get();
    }

    /**
     * Bangun nama file export berdasarkan format.
     *
     * @param  string  $format  Format export (csv/json)
     */
    public function buildFilename(string $format): string
    {
        return 'laporan-surat-' . now()->format('Ymd-His') . '.' . $format;
    }

    /**
     * Bangun konten PDF sederhana tanpa library eksternal.
     * PDF ini cukup untuk kebutuhan export arsip/rekap laporan admin.
     *
     * @param  \Illuminate\Support\Collection<int, object>  $rows
     * @param  array<string, mixed>  $filters
     */
    public function buildPdfContent(Collection $rows, array $filters = []): string
    {
        $content = '';
        $pageWidth = 842.0;   // A4 landscape
        $pageHeight = 595.0;  // A4 landscape
        $margin = 30.0;
        $tableTop = 495.0;
        $rowHeight = 22.0;
        $maxRows = 16;

        // Header title
        $content .= "BT\n/F2 16 Tf\n30 560 Td\n( LAPORAN SURAT - ADMIN ) Tj\nET\n";
        $content .= "BT\n/F1 9 Tf\n30 542 Td\n(" . $this->escapePdfText('Diekspor: ' . now()->format('d-m-Y H:i:s')) . ") Tj\nET\n";
        $content .= "BT\n/F1 9 Tf\n30 528 Td\n(" . $this->escapePdfText(
            'Filter tanggal: ' . ($filters['date_from'] ?? '-') . ' s/d ' . ($filters['date_to'] ?? '-')
        ) . ") Tj\nET\n";
        $content .= "BT\n/F1 9 Tf\n30 514 Td\n(" . $this->escapePdfText('Total data: ' . $rows->count()) . ") Tj\nET\n";

        $columns = [
            ['title' => 'Tanggal', 'width' => 68.0, 'key' => 'issued_date'],
            ['title' => 'Nomor', 'width' => 116.0, 'key' => 'formatted_number'],
            ['title' => 'Klasifikasi', 'width' => 138.0, 'key' => 'classification'],
            ['title' => 'Perihal', 'width' => 178.0, 'key' => 'subject'],
            ['title' => 'Pemohon', 'width' => 92.0, 'key' => 'requested_by'],
            ['title' => 'Divisi', 'width' => 88.0, 'key' => 'division'],
            ['title' => 'Status', 'width' => 62.0, 'key' => 'status'],
        ];

        $content .= $this->drawRect($margin, $tableTop, $pageWidth - ($margin * 2), $rowHeight);

        // Header cells
        $x = $margin;
        foreach ($columns as $column) {
            $content .= $this->drawRect($x, $tableTop, $column['width'], $rowHeight);
            $content .= $this->drawText((string) $column['title'], $x + 4, $tableTop + 7, 8, true);
            $x += $column['width'];
        }

        $y = $tableTop - $rowHeight;
        $dataRows = $rows->take($maxRows);

        foreach ($dataRows as $index => $row) {
            $x = $margin;
            foreach ($columns as $column) {
                $content .= $this->drawRect($x, $y, $column['width'], $rowHeight);

                $rawValue = $column['key'] === 'formatted_number'
                    ? (string) ($row->formatted_number ?: $row->number)
                    : (string) ($row->{$column['key']} ?? '-');
                $text = $this->truncateText($rawValue, (int) floor($column['width'] / 4.6));

                $content .= $this->drawText($text, $x + 4, $y + 7, 8, false);
                $x += $column['width'];
            }

            $y -= $rowHeight;
        }

        if ($rows->count() > $maxRows) {
            $remaining = $rows->count() - $maxRows;
            $content .= $this->drawText("... {$remaining} baris lainnya tidak ditampilkan pada halaman ini", 30, 108, 8, false);
        }

        $content .= $this->drawText('SIMONS - Sistem Informasi Manajemen Penomoran Surat', 30, 38, 8, false);

        return $this->generateSimplePdf($content, $pageWidth, $pageHeight);
    }

    /**
     * Buat file PDF 1 halaman dengan konten drawing/text.
     */
    private function generateSimplePdf(string $content, float $pageWidth, float $pageHeight): string
    {
        $objects = [];
        $objects[] = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
        $objects[] = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
        $objects[] = "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {$pageWidth} {$pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n";
        $objects[] = "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
        $objects[] = "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n";
        $objects[] = "6 0 obj\n<< /Length " . strlen($content) . " >>\nstream\n{$content}\nendstream\nendobj\n";

        $pdf = "%PDF-1.4\n";
        $offsets = [0];

        foreach ($objects as $object) {
            $offsets[] = strlen($pdf);
            $pdf .= $object;
        }

        $xrefOffset = strlen($pdf);
        $pdf .= "xref\n0 " . (count($objects) + 1) . "\n";
        $pdf .= "0000000000 65535 f \n";

        for ($i = 1; $i <= count($objects); $i++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$i]);
        }

        $pdf .= "trailer\n<< /Size " . (count($objects) + 1) . " /Root 1 0 R >>\n";
        $pdf .= "startxref\n{$xrefOffset}\n%%EOF";

        return $pdf;
    }

    private function drawRect(float $x, float $y, float $w, float $h): string
    {
        return sprintf("0 0 0 RG 0.5 w %.2F %.2F %.2F %.2F re S\n", $x, $y, $w, $h);
    }

    private function drawText(string $text, float $x, float $y, int $fontSize = 9, bool $bold = false): string
    {
        $font = $bold ? 'F2' : 'F1';

        return "BT\n0 0 0 rg\n/{$font} {$fontSize} Tf\n{$x} {$y} Td\n(" . $this->escapePdfText($text) . ") Tj\nET\n";
    }

    private function escapePdfText(string $text): string
    {
        $text = $this->normalizePdfText($text);

        return str_replace(
            ['\\', '(', ')'],
            ['\\\\', '\(', '\)'],
            $text
        );
    }

    private function truncateText(string $text, int $maxLength): string
    {
        $length = function_exists('mb_strlen') ? mb_strlen($text) : strlen($text);
        if ($length <= $maxLength) {
            return $text;
        }

        $slice = function_exists('mb_substr')
            ? mb_substr($text, 0, $maxLength - 3)
            : substr($text, 0, $maxLength - 3);

        return $slice . '...';
    }

    private function normalizePdfText(string $text): string
    {
        $clean = preg_replace('/[\r\n\t]+/', ' ', $text) ?? $text;
        $clean = str_replace(['—', '–'], '-', $clean);
        $ascii = function_exists('iconv')
            ? iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $clean)
            : false;

        if ($ascii === false) {
            return preg_replace('/[^\x20-\x7E]/', '', $clean) ?? '';
        }

        return preg_replace('/[^\x20-\x7E]/', '', $ascii) ?? '';
    }
}
