<?php

namespace App\Services;

class ExportService
{
    /**
     * Mengekspor data surat ke format Excel berdasarkan filter yang diberikan.
     *
     * @param  array  $filters  Filter pencarian (tanggal, klasifikasi, status, dsb.)
     * @return string           Path file Excel yang dihasilkan
     *
     * TODO: Implementasi butuh maatwebsite/excel
     */
    public function exportExcel(array $filters): string
    {
        /* TODO */
        return '';
    }

    /**
     * Mengekspor data surat ke format PDF berdasarkan filter yang diberikan.
     *
     * @param  array  $filters  Filter pencarian (tanggal, klasifikasi, status, dsb.)
     * @return string           Path file PDF yang dihasilkan
     *
     * TODO: Implementasi butuh barryvdh/laravel-dompdf
     */
    public function exportPdf(array $filters): string
    {
        /* TODO */
        return '';
    }
}
