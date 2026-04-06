import { useState, useCallback, useRef } from 'react';
import { getUsers, createUser, updateUser, toggleActive } from '../api/users.api';

/**
 * useUsers — custom hook untuk mengelola data user (admin).
 *
 * State: users, loading, error, meta, actionLoading, actionError
 * Functions: fetchUsers(params), refetch(), handleCreateUser(data),
 *            handleUpdateUser(id, data), handleToggleActive(id)
 *
 * Mendukung filter: search, role, is_active
 */
export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  // Loading & error state untuk aksi individual (create, update, toggle)
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Simpan params terakhir untuk refetch
  const lastParamsRef = useRef({});

  /**
   * Fetch daftar user dengan parameter filter & pagination
   * @param {Object} params - { page, search, role, is_active }
   */
  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    lastParamsRef.current = params;

    try {
      const response = await getUsers(params);
      setUsers(response.data || []);
      setMeta(response.meta || null);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Gagal memuat daftar user. Silakan coba lagi.';
      setError(message);
      setUsers([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refetch data dengan params terakhir
   */
  const refetch = useCallback(() => {
    return fetchUsers(lastParamsRef.current);
  }, [fetchUsers]);

  /**
   * Buat user baru
   * @param {Object} data - { name, email, password, password_confirmation, division, role }
   * @returns {Object} response data jika sukses
   */
  const handleCreateUser = useCallback(async (data) => {
    setActionLoading(true);
    setActionError(null);

    try {
      const response = await createUser(data);
      // Refetch list setelah create
      await refetch();
      return response;
    } catch (err) {
      const message =
        err.response?.data?.message || 'Gagal membuat user baru.';
      setActionError(message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [refetch]);

  /**
   * Update data user
   * @param {number} id - ID user
   * @param {Object} data - { name, email, division, role }
   * @returns {Object} response data jika sukses
   */
  const handleUpdateUser = useCallback(async (id, data) => {
    setActionLoading(true);
    setActionError(null);

    try {
      const response = await updateUser(id, data);
      // Refetch list setelah update
      await refetch();
      return response;
    } catch (err) {
      const message =
        err.response?.data?.message || 'Gagal memperbarui data user.';
      setActionError(message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [refetch]);

  /**
   * Toggle status aktif/nonaktif user
   * @param {number} id - ID user
   * @returns {Object} response data jika sukses
   */
  const handleToggleActive = useCallback(async (id) => {
    setActionLoading(true);
    setActionError(null);

    try {
      const response = await toggleActive(id);
      // Refetch list setelah toggle
      await refetch();
      return response;
    } catch (err) {
      const message =
        err.response?.data?.message || 'Gagal mengubah status user.';
      setActionError(message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [refetch]);

  return {
    users,
    loading,
    error,
    meta,
    actionLoading,
    actionError,
    setActionError,
    fetchUsers,
    refetch,
    handleCreateUser,
    handleUpdateUser,
    handleToggleActive,
  };
}
