import { useState, useCallback, useRef } from 'react';
import {
  getAllRequests,
  approveRequest as approveApi,
  rejectRequest as rejectApi,
} from '../api/gapRequests.api';

/**
 * useAdminGapRequests — custom hook untuk mengelola gap request (admin).
 *
 * State: requests, loading, error, meta
 * Functions: fetchAllRequests(params), approveRequest(id), rejectRequest(id, reason), refetch()
 *
 * Mendukung tab filter: pending, approved, rejected, semua
 */
export function useAdminGapRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  // Simpan params terakhir untuk refetch
  const lastParamsRef = useRef({});

  /**
   * Fetch semua gap request (admin) dengan filter & pagination
   * @param {Object} params - { page, status }
   */
  const fetchAllRequests = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    lastParamsRef.current = params;

    try {
      const response = await getAllRequests(params);
      setRequests(response.data || []);
      setMeta(response.meta || null);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Gagal memuat daftar gap request. Silakan coba lagi.';
      setError(message);
      setRequests([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Approve gap request — mengembalikan data response termasuk nomor yang diterbitkan
   * @param {number} id
   * @returns {Promise<Object>} response.data (berisi nomor surat)
   */
  const approveRequest = useCallback(async (id) => {
    try {
      const response = await approveApi(id);
      return response;
    } catch (err) {
      const message =
        err.response?.data?.message || 'Gagal menyetujui gap request.';
      throw new Error(message);
    }
  }, []);

  /**
   * Reject gap request dengan alasan
   * @param {number} id
   * @param {string} reason
   */
  const rejectRequest = useCallback(async (id, reason) => {
    try {
      const response = await rejectApi(id, reason);
      return response;
    } catch (err) {
      const message =
        err.response?.data?.message || 'Gagal menolak gap request.';
      throw new Error(message);
    }
  }, []);

  /**
   * Refetch data dengan params terakhir
   */
  const refetch = useCallback(() => {
    return fetchAllRequests(lastParamsRef.current);
  }, [fetchAllRequests]);

  return {
    requests,
    loading,
    error,
    meta,
    fetchAllRequests,
    approveRequest,
    rejectRequest,
    refetch,
  };
}
