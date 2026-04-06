import { useState, useCallback } from 'react';
import { getSummary } from '../api/reports.api';
import { getAllRequests } from '../api/gapRequests.api';
import { getToday } from '../api/sequences.api';
import { getUsers } from '../api/users.api';
import { getLogs } from '../api/auditLogs.api';

/**
 * useAdminDashboard — custom hook untuk data dashboard admin.
 *
 * Mengambil 4 summary card + 10 audit log terbaru.
 * Setiap card punya loading & error state independen
 * supaya UI bisa render partial data.
 */
export function useAdminDashboard() {
  // === Summary cards state ===
  const [todayLetters, setTodayLetters] = useState(null);
  const [pendingGaps, setPendingGaps] = useState(null);
  const [activeSequences, setActiveSequences] = useState([]);
  const [activeUsers, setActiveUsers] = useState(null);

  // === Audit logs state ===
  const [auditLogs, setAuditLogs] = useState([]);

  // === Loading states ===
  const [cardsLoading, setCardsLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);

  // === Error states ===
  const [cardsError, setCardsError] = useState(null);
  const [logsError, setLogsError] = useState(null);

  /**
   * Fetch semua data summary card secara paralel.
   * Menggunakan Promise.allSettled agar satu gagal tidak menghentikan yang lain.
   */
  const fetchCards = useCallback(async () => {
    setCardsLoading(true);
    setCardsError(null);

    try {
      const today = new Date().toISOString().split('T')[0];

      const [summaryRes, gapRes, usersRes] = await Promise.allSettled([
        // 1. Total surat hari ini
        getSummary({ date: today }),
        // 2. Total gap request pending
        getAllRequests({ status: 'pending', per_page: 1 }),
        // 3. Total user aktif
        getUsers({ is_active: true, per_page: 1 }),
      ]);

      // Parse results — set null jika gagal
      if (summaryRes.status === 'fulfilled') {
        setTodayLetters(summaryRes.value.data);
      }

      if (gapRes.status === 'fulfilled') {
        setPendingGaps(gapRes.value.meta?.total ?? gapRes.value.data?.length ?? 0);
      }

      if (usersRes.status === 'fulfilled') {
        setActiveUsers(usersRes.value.meta?.total ?? usersRes.value.data?.length ?? 0);
      }

      // Cek apakah ada yang gagal total
      const allFailed = [summaryRes, gapRes, usersRes].every(
        (r) => r.status === 'rejected'
      );
      if (allFailed) {
        setCardsError('Gagal memuat data dashboard. Silakan coba lagi.');
      }
    } catch (err) {
      setCardsError(
        err.response?.data?.message || 'Gagal memuat data dashboard.'
      );
    } finally {
      setCardsLoading(false);
    }
  }, []);

  /**
   * Fetch sequence hari ini untuk klasifikasi tertentu
   */
  const fetchSequenceForClassification = useCallback(async (classificationId) => {
    try {
      const response = await getToday(classificationId);
      return response.data;
    } catch {
      return null;
    }
  }, []);

  /**
   * Fetch 10 audit log terbaru
   */
  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    setLogsError(null);

    try {
      const response = await getLogs({ per_page: 10 });
      setAuditLogs(response.data || []);
    } catch (err) {
      setLogsError(
        err.response?.data?.message || 'Gagal memuat audit log.'
      );
      setAuditLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  /**
   * Fetch semua data dashboard (cards + logs)
   */
  const fetchAll = useCallback(async () => {
    await Promise.all([fetchCards(), fetchLogs()]);
  }, [fetchCards, fetchLogs]);

  return {
    // Cards
    todayLetters,
    pendingGaps,
    activeSequences,
    activeUsers,
    cardsLoading,
    cardsError,

    // Logs
    auditLogs,
    logsLoading,
    logsError,

    // Actions
    fetchAll,
    fetchCards,
    fetchLogs,
    fetchSequenceForClassification,
  };
}
