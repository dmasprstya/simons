import { useState, useCallback, useRef } from 'react';
import { getLogs, getLog } from '../api/auditLogs.api';

/**
 * useAuditLogs — custom hook untuk mengelola data audit log (admin).
 *
 * State: logs, loading, error, meta, selectedLog, detailLoading
 * Functions: fetchLogs(params), refetch(), fetchLogDetail(id)
 *
 * Mendukung filter: search (user), action, auditable_type, date_from, date_to
 * Pagination: 50 per halaman
 */
export function useAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  // Detail log yang dipilih
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Simpan params terakhir untuk refetch
  const lastParamsRef = useRef({});

  /**
   * Fetch daftar audit log dengan parameter filter & pagination
   * @param {Object} params - { page, search, action, auditable_type, date_from, date_to, per_page }
   */
  const fetchLogs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    // Default 50 per halaman
    const fetchParams = { per_page: 50, ...params };
    lastParamsRef.current = fetchParams;

    try {
      const response = await getLogs(fetchParams);
      setLogs(response.data || []);
      setMeta(response.meta || null);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Gagal memuat audit log. Silakan coba lagi.';
      setError(message);
      setLogs([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refetch data dengan params terakhir
   */
  const refetch = useCallback(() => {
    return fetchLogs(lastParamsRef.current);
  }, [fetchLogs]);

  /**
   * Fetch detail satu audit log (untuk modal detail)
   * @param {number} id
   */
  const fetchLogDetail = useCallback(async (id) => {
    setDetailLoading(true);

    try {
      const response = await getLog(id);
      setSelectedLog(response.data || null);
    } catch (err) {
      console.error('Gagal memuat detail audit log:', err);
      setSelectedLog(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  /**
   * Bersihkan selected log (saat modal ditutup)
   */
  const clearSelectedLog = useCallback(() => {
    setSelectedLog(null);
  }, []);

  return {
    logs,
    loading,
    error,
    meta,
    selectedLog,
    detailLoading,
    fetchLogs,
    refetch,
    fetchLogDetail,
    clearSelectedLog,
  };
}
