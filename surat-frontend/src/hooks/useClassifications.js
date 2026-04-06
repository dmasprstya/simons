import { useState, useCallback } from 'react';
import {
  getRoots,
  getChildren,
  createClassification,
  updateClassification,
  toggleActive,
} from '../api/classifications.api';

/**
 * useClassifications — custom hook untuk mengelola klasifikasi tree (admin).
 *
 * State: roots, childrenMap, expandedIds, loading, error, actionLoading, actionError
 * Functions: fetchRoots(params), fetchChildren(parentId), toggleExpand(id),
 *            handleCreate(data), handleUpdate(id, data), handleToggleActive(id)
 *
 * Mendukung filter: type, is_active
 */
export function useClassifications() {
  const [roots, setRoots] = useState([]);
  const [childrenMap, setChildrenMap] = useState({});
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Loading & error untuk aksi individual
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Loading state per-node saat fetch children
  const [loadingChildrenIds, setLoadingChildrenIds] = useState(new Set());

  // Simpan filter terakhir untuk refetch
  const [lastFilter, setLastFilter] = useState({});

  /**
   * Fetch klasifikasi root (Level 1)
   * @param {Object} params - { type, is_active }
   */
  const fetchRoots = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    setLastFilter(params);

    try {
      const response = await getRoots(params);
      setRoots(response.data || []);
      // Reset tree state saat fetch ulang
      setChildrenMap({});
      setExpandedIds(new Set());
    } catch (err) {
      const message =
        err.response?.data?.message || 'Gagal memuat data klasifikasi.';
      setError(message);
      setRoots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch children dari parent tertentu
   * @param {number} parentId
   */
  const fetchChildren = useCallback(async (parentId) => {
    setLoadingChildrenIds((prev) => new Set(prev).add(parentId));

    try {
      const response = await getChildren(parentId);
      const children = response.data || [];
      setChildrenMap((prev) => ({ ...prev, [parentId]: children }));
      return children;
    } catch (err) {
      console.error('Gagal memuat sub-klasifikasi:', err);
      return [];
    } finally {
      setLoadingChildrenIds((prev) => {
        const next = new Set(prev);
        next.delete(parentId);
        return next;
      });
    }
  }, []);

  /**
   * Toggle expand/collapse node tree
   * Jika expand pertama kali, fetch children dari API
   */
  const toggleExpand = useCallback(
    async (id) => {
      const next = new Set(expandedIds);

      if (next.has(id)) {
        // Collapse — hapus dari expanded
        next.delete(id);
        setExpandedIds(next);
      } else {
        // Expand — fetch children jika belum ada di cache
        next.add(id);
        setExpandedIds(next);

        if (!childrenMap[id]) {
          await fetchChildren(id);
        }
      }
    },
    [expandedIds, childrenMap, fetchChildren]
  );

  /**
   * Buat klasifikasi baru
   * @param {Object} data - { code, name, parent_id, type, level }
   */
  const handleCreate = useCallback(
    async (data) => {
      setActionLoading(true);
      setActionError(null);

      try {
        const response = await createClassification(data);

        // Jika punya parent, refresh children parent tsb
        if (data.parent_id) {
          await fetchChildren(data.parent_id);
        } else {
          // Refresh roots
          await fetchRoots(lastFilter);
        }

        return response;
      } catch (err) {
        const message =
          err.response?.data?.message || 'Gagal membuat klasifikasi baru.';
        setActionError(message);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [fetchRoots, fetchChildren, lastFilter]
  );

  /**
   * Update data klasifikasi
   * @param {number} id
   * @param {Object} data - { code, name, type }
   */
  const handleUpdate = useCallback(
    async (id, data) => {
      setActionLoading(true);
      setActionError(null);

      try {
        const response = await updateClassification(id, data);

        // Refresh parent-nya (atau roots jika level 1)
        if (data.parent_id) {
          await fetchChildren(data.parent_id);
        } else {
          await fetchRoots(lastFilter);
        }

        return response;
      } catch (err) {
        const message =
          err.response?.data?.message || 'Gagal memperbarui klasifikasi.';
        setActionError(message);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [fetchRoots, fetchChildren, lastFilter]
  );

  /**
   * Toggle status aktif/nonaktif klasifikasi
   * @param {number} id
   * @param {number|null} parentId - parent ID untuk refresh tree
   */
  const handleToggleActive = useCallback(
    async (id, parentId = null) => {
      setActionLoading(true);
      setActionError(null);

      try {
        const response = await toggleActive(id);

        // Refresh parent atau roots
        if (parentId) {
          await fetchChildren(parentId);
        } else {
          await fetchRoots(lastFilter);
        }

        return response;
      } catch (err) {
        const message =
          err.response?.data?.message || 'Gagal mengubah status klasifikasi.';
        setActionError(message);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [fetchRoots, fetchChildren, lastFilter]
  );

  return {
    roots,
    childrenMap,
    expandedIds,
    loading,
    error,
    actionLoading,
    actionError,
    setActionError,
    loadingChildrenIds,
    fetchRoots,
    fetchChildren,
    toggleExpand,
    handleCreate,
    handleUpdate,
    handleToggleActive,
  };
}
