import { useState, useCallback, useRef } from 'react';
import { getMyLetters, voidLetter as voidLetterApi } from '../api/letters.api';

/**
 * useLetters — custom hook untuk mengelola data surat milik user.
 *
 * State: letters, loading, error, meta
 * Functions: fetchMyLetters(params), voidLetter(id), refetch()
 *
 * Menyimpan params terakhir untuk mendukung refetch() tanpa perlu
 * kirim ulang parameter.
 */
export function useLetters() {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  // Simpan params terakhir untuk refetch
  const lastParamsRef = useRef({});

  /**
   * Fetch daftar surat milik user dengan parameter filter & pagination
   * @param {Object} params - { page, classification_id, date_from, date_to, per_page }
   */
  const fetchMyLetters = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    lastParamsRef.current = params;

    try {
      const response = await getMyLetters(params);
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
   * Void/batalkan surat berdasarkan ID
   * @param {number} id — ID surat yang akan dibatalkan
   * @returns {Promise<Object>} — response dari API jika sukses
   * @throws {Error} — jika gagal, throw error dengan pesan dari API
   */
  const voidLetter = useCallback(async (id) => {
    try {
      const response = await voidLetterApi(id);
      return response;
    } catch (err) {
      const message =
        err.response?.data?.message || 'Gagal membatalkan surat. Silakan coba lagi.';
      throw new Error(message);
    }
  }, []);

  /**
   * Refetch data dengan params terakhir yang digunakan
   */
  const refetch = useCallback(() => {
    return fetchMyLetters(lastParamsRef.current);
  }, [fetchMyLetters]);

  return {
    letters,
    loading,
    error,
    meta,
    fetchMyLetters,
    voidLetter,
    refetch,
  };
}
