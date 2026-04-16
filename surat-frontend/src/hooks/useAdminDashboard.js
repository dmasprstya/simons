import { useState, useCallback } from 'react';
import { getAdminDashboardData } from '../api/dashboard.api';

/**
 * useAdminDashboard — custom hook untuk data dashboard admin.
 *
 * Menggantikan 5 request paralel sebelumnya (getSummary, getAllRequests,
 * getUsers, getRecentLetters, getLogs) dengan satu aggregate call ke
 * GET /api/dashboard/admin.
 *
 * fetchData didefinisikan dengan useCallback agar komponen bisa memanggil
 * ulang (retry) tanpa menyebabkan re-render loop.
 */
export function useAdminDashboard() {
  const [stats, setStats] = useState({ today_letters: 0, pending_gaps: 0, active_users: 0 });
  const [allRecentLetters, setAllRecentLetters] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [sequence, setSequence] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminDashboardData();
      const d = res.data;
      setStats(d.stats);
      setAllRecentLetters(d.all_recent_letters || []);
      setAuditLogs(d.audit_logs || []);
      setSequence(d.sequence);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data dashboard admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    allRecentLetters,
    auditLogs,
    sequence,
    loading,
    error,
    fetchAll,
  };
}
