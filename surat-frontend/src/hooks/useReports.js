import { useState, useCallback } from 'react';
import { getSummary, exportReport, getWorkUnits } from '../api/reports.api';
import { generateExcel } from '../utils/excelExport';

/**
 * useReports — custom hook untuk halaman Reports.
 *
 * Mengambil data ringkasan laporan dan mengelola export file.
 *
 * Returns:
 *   summary       — object data ringkasan (total, breakdown per klasifikasi, per divisi)
 *   loading       — boolean, sedang fetch summary
 *   error         — string | null, error message
 *   exporting     — 'csv' | 'pdf' | null, format yang sedang diexport
 *   exportError   — string | null, error saat export
 *   fetchSummary  — function(params) untuk fetch data
 *   handleExport  — function(format, params) untuk export file
 */
export function useReports() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [exporting, setExporting] = useState(null);
  const [exportError, setExportError] = useState(null);

  const [workUnits, setWorkUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);

  /**
   * Fetch data ringkasan laporan
   */
  const fetchSummary = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getSummary(params);
      setSummary(response.data);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Gagal memuat data laporan.';
      setError(message);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Export laporan sebagai file (CSV/PDF)
   * Menggunakan blob response dari API, trigger download otomatis
   */
  const handleExport = useCallback(async (format, params = {}) => {
    setExporting(format);
    setExportError(null);

    try {
      await exportReport({ ...params, format });
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || `Gagal mengekspor ${format.toUpperCase()}.`;
      setExportError(message);
      return { success: false, error: message };
    } finally {
      setExporting(null);
    }
  }, []);

  /**
   * Export laporan sebagai file Excel (XLSX) menggunakan ExcelJS
   */
  const handleExcelExport = useCallback(async (params = {}) => {
    setExporting('excel');
    setExportError(null);

    try {
      const response = await exportReport({ ...params, format: 'json' });
      const data = response.data || [];
      
      await generateExcel(data, {
        title: 'SIMONS — Sistem Informasi Manajemen Penomoran Surat',
        subtitle: 'Laporan Data Nomor Surat',
        filename: `laporan-surat-${new Date().getTime()}.xlsx`
      });

      return { success: true };
    } catch (err) {
      const message = err.message || 'Gagal mengekspor EXCEL.';
      setExportError(message);
      return { success: false, error: message };
    } finally {
      setExporting(null);
    }
  }, []);

  /**
   * Fetch daftar unit kerja untuk dropdown
   */
  const fetchWorkUnits = useCallback(async () => {
    setUnitsLoading(true);
    try {
      const res = await getWorkUnits();
      setWorkUnits(res.data || []);
    } catch (err) {
      console.error('Failed to fetch work units', err);
      setWorkUnits([]);
    } finally {
      setUnitsLoading(false);
    }
  }, []);

  return {
    summary,
    loading,
    error,
    exporting,
    exportError,
    workUnits,
    unitsLoading,
    fetchSummary,
    handleExport,
    handleExcelExport,
    fetchWorkUnits,
  };
}
