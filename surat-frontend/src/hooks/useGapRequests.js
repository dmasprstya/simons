import { useState, useCallback, useRef } from 'react';
import { getMyRequests, createRequest as createRequestApi, getVacantNumbers } from '../api/gapRequests.api';

/**
 * useGapRequests — custom hook untuk mengelola data gap request milik user.
 *
 * State: requests, loading, error, meta
 * Functions: fetchMyRequests(params), createRequest(data), refetch()
 *
 * Menyimpan params terakhir untuk mendukung refetch() tanpa perlu
 * kirim ulang parameter.
 */
export function useGapRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  // Vacant Numbers state
  const [vacantNumbers, setVacantNumbers] = useState([]);
  const [vacantMeta, setVacantMeta] = useState(null);
  const [vacantLoading, setVacantLoading] = useState(false);
  const [vacantError, setVacantError] = useState(null);

  // Simpan params terakhir untuk refetch
  const lastParamsRef = useRef({});

  /**
   * Fetch daftar gap request milik user dengan parameter filter & pagination
   * @param {Object} params - { page, status }
   */
  const fetchMyRequests = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    lastParamsRef.current = params;

    try {
      const response = await getMyRequests(params);
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
   * Buat gap request baru
   * @param {Object} data - { classification_id, gap_date, reason }
   * @returns {Promise<Object>} — response dari API jika sukses
   * @throws {Error} — jika gagal, throw error dengan pesan dari API
   */
  const createRequest = useCallback(async (data) => {
    try {
      const response = await createRequestApi(data);
      return response;
    } catch (err) {
      const message =
        err.response?.data?.message || 'Gagal mengirim gap request. Silakan coba lagi.';
      throw new Error(message);
    }
  }, []);

  /**
   * Refetch data dengan params terakhir yang digunakan
   */
  const refetch = useCallback(() => {
    return fetchMyRequests(lastParamsRef.current);
  }, [fetchMyRequests]);

  /**
   * Fetch daftar nomor gap yang kosong/tersedia
   * @param {Object} params - { date_from, date_to, page }
   */
  const fetchVacantNumbers = useCallback(async (params = {}) => {
    setVacantLoading(true);
    setVacantError(null);

    try {
      const response = await getVacantNumbers(params);
      setVacantNumbers(response.data || []);
      setVacantMeta(response.meta || null);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Gagal memuat daftar nomor gap kosong. Silakan coba lagi.';
      setVacantError(message);
      setVacantNumbers([]);
      setVacantMeta(null);
    } finally {
      setVacantLoading(false);
    }
  }, []);

  return {
    requests,
    loading,
    error,
    meta,
    fetchMyRequests,
    createRequest,
    refetch,
    vacantNumbers,
    vacantMeta,
    vacantLoading,
    vacantError,
    fetchVacantNumbers,
  };
}
