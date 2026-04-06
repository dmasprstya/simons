import { useState, useCallback, useRef } from 'react';
import { getAllLetters } from '../api/letters.api';

/**
 * useAdminLetters — custom hook untuk mengelola data surat seluruh user (admin).
 *
 * State: letters, loading, error, meta
 * Functions: fetchAllLetters(params), refetch()
 *
 * Mendukung filter: search, classification_id, date_from, date_to, status, division
 */
export function useAdminLetters() {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  // Simpan params terakhir untuk refetch
  const lastParamsRef = useRef({});

  /**
   * Fetch semua surat dengan parameter filter & pagination
   * @param {Object} params - { page, search, classification_id, date_from, date_to, status, division }
   */
  const fetchAllLetters = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    lastParamsRef.current = params;

    try {
      const response = await getAllLetters(params);
      setLetters(response.data || []);
      setMeta(response.meta || null);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Gagal memuat daftar surat. Silakan coba lagi.';
      setError(message);
      setLetters([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refetch data dengan params terakhir yang digunakan
   */
  const refetch = useCallback(() => {
    return fetchAllLetters(lastParamsRef.current);
  }, [fetchAllLetters]);

  return {
    letters,
    loading,
    error,
    meta,
    fetchAllLetters,
    refetch,
  };
}
