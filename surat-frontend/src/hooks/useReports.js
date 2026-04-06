import { useState, useCallback } from 'react';
import { getSummary, exportReport } from '../api/reports.api';

/**
 * useReports — custom hook untuk halaman Reports.
 *
 * Mengambil data ringkasan laporan dan mengelola export file.
 *
 * Returns:
 *   summary       — object data ringkasan (total, breakdown per klasifikasi, per divisi)
 *   loading       — boolean, sedang fetch summary
 *   error         — string | null, error message
 *   exporting     — 'excel' | 'pdf' | null, format yang sedang diexport
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
   * Export laporan sebagai file (Excel/PDF)
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
        err.response?.data?.message || `Gagal mengekspor ${format.toUpperCase()}.`;
      setExportError(message);
      return { success: false, error: message };
    } finally {
      setExporting(null);
    }
  }, []);

  return {
    summary,
    loading,
    error,
    exporting,
    exportError,
    fetchSummary,
    handleExport,
  };
}
