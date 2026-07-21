import { useState, useCallback, useRef, useEffect } from 'react';
import { getAdminDashboardData } from '../api/dashboard.api';

export function useAdminDashboard() {
  const [stats, setStats] = useState({ today_letters: 0, pending_gaps: 0, active_users: 0, total_letters: 0 });
  const [allRecentLetters, setAllRecentLetters] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [trends, setTrends] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [sequence, setSequence] = useState(null);

  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(false);
  const [error, setError] = useState(null);

  const isInitialLoad = useRef(true);
  const lastParamsRef = useRef({});

  const fetchAll = useCallback(async (params = {}, silent = false) => {
    const isPeriodChange = params.trend_period && params.trend_period !== lastParamsRef.current.trend_period;
    lastParamsRef.current = params;

    if (!silent) {
      if (isInitialLoad.current) {
        setLoading(true);
      } else if (isPeriodChange) {
        setTrendLoading(true);
      }
    }
    setError(null);
    try {
      const res = await getAdminDashboardData(params);
      const d = res.data;
      setStats(d.stats);
      setAllRecentLetters(d.all_recent_letters || []);
      setAuditLogs(d.audit_logs || []);
      setTrends(d.trends || []);
      setDistributions(d.distributions || []);
      setSequence(d.sequence);
      isInitialLoad.current = false;
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data dashboard admin.');
    } finally {
      setLoading(false);
      setTrendLoading(false);
    }
  }, []);

  useEffect(() => {
    const handlePoll = () => {
      if (document.visibilityState === 'visible') {
        fetchAll(lastParamsRef.current, true);
      }
    };

    const intervalId = setInterval(handlePoll, 3000);

    const handleFocus = () => {
      fetchAll(lastParamsRef.current, true);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handlePoll);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handlePoll);
    };
  }, [fetchAll]);

  return {
    stats,
    allRecentLetters,
    auditLogs,
    trends,
    distributions,
    sequence,
    loading,
    trendLoading,
    error,
    fetchAll,
  };
}
