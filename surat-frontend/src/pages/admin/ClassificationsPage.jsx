import { useState, useEffect, useCallback } from 'react';
import { useClassifications } from '../../hooks/useClassifications';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

/**
 * ClassificationsPage — Halaman admin: kelola klasifikasi dalam format tree.
 *
 * Fitur:
 * - Tree view: Level 1 → expand Level 2 → expand Level 3
 * - Kolom per baris: Kode | Nama | Type | Level | Status | Aksi
 * - Aksi: Toggle is_active, Tambah Child, Edit
 * - Filter: type (substantif|fasilitatif), status (aktif|nonaktif)
 */

/**
 * TreeRow — Satu baris di tree table, renderkan secara rekursif children-nya.
 */
function TreeRow({
  item,
  level,
  parentId,
  expandedIds,
  childrenMap,
  loadingChildrenIds,
  onToggleExpand,
  onEdit,
  onAddChild,
  onToggleActive,
}) {
  const isExpanded = expandedIds.has(item.id);
  const isLoadingChildren = loadingChildrenIds.has(item.id);
  const children = childrenMap[item.id] || [];
  const hasChildren = item.children_count > 0 || children.length > 0;

  // Level 3 tidak bisa punya child lagi
  const canAddChild = (item.level || level) < 3;

  // Indentasi berdasarkan level
  const paddingLeft = `${(level - 1) * 32 + 16}px`;

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100">
        {/* Kode — dengan expand/collapse toggle */}
        <td className="py-3 text-sm text-gray-900 whitespace-nowrap" style={{ paddingLeft }}>
          <div className="flex items-center gap-2">
            {/* Expand/collapse button */}
            {hasChildren || canAddChild ? (
              <button
                type="button"
                onClick={() => onToggleExpand(item.id)}
                className={`
                  flex items-center justify-center h-6 w-6 rounded-md text-gray-400
                  hover:bg-gray-200 hover:text-gray-600 transition-all duration-200
                  ${isExpanded ? 'rotate-90' : ''}
                `}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ) : (
              <span className="inline-block w-6" />
            )}

            {/* Level indicator dot */}
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                level === 1
                  ? 'bg-indigo-500'
                  : level === 2
                  ? 'bg-blue-400'
                  : 'bg-gray-400'
              }`}
            />

            <span className="font-mono font-semibold text-gray-800">
              {item.code}
            </span>
          </div>
        </td>

        {/* Nama */}
        <td className="px-4 py-3 text-sm text-gray-700">
          {item.name}
        </td>

        {/* Type */}
        <td className="px-4 py-3 text-sm">
          <Badge variant={item.type === 'substantif' ? 'info' : 'warning'}>
            {item.type === 'substantif' ? 'Substantif' : 'Fasilitatif'}
          </Badge>
        </td>

        {/* Level */}
        <td className="px-4 py-3 text-sm text-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
            {item.level || level}
          </span>
        </td>

        {/* Status */}
        <td className="px-4 py-3 text-sm">
          <Badge variant={item.is_active ? 'success' : 'danger'}>
            {item.is_active ? 'Aktif' : 'Nonaktif'}
          </Badge>
        </td>

        {/* Aksi */}
        <td className="px-4 py-3 text-sm whitespace-nowrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(item, parentId)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
            >
              Edit
            </button>
            {canAddChild && (
              <button
                type="button"
                onClick={() => onAddChild(item)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                + Child
              </button>
            )}
            <button
              type="button"
              onClick={() => onToggleActive(item, parentId)}
              className={`text-sm font-medium transition-colors ${
                item.is_active
                  ? 'text-red-600 hover:text-red-800'
                  : 'text-emerald-600 hover:text-emerald-800'
              }`}
            >
              {item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
          </div>
        </td>
      </tr>

      {/* Loading children spinner */}
      {isExpanded && isLoadingChildren && (
        <tr>
          <td colSpan={6} style={{ paddingLeft: `${level * 32 + 16}px` }} className="py-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <LoadingSpinner size="sm" />
              <span>Memuat sub-klasifikasi...</span>
            </div>
          </td>
        </tr>
      )}

      {/* Children rows — rekursif */}
      {isExpanded &&
        !isLoadingChildren &&
        children.map((child) => (
          <TreeRow
            key={child.id}
            item={child}
            level={level + 1}
            parentId={item.id}
            expandedIds={expandedIds}
            childrenMap={childrenMap}
            loadingChildrenIds={loadingChildrenIds}
            onToggleExpand={onToggleExpand}
            onEdit={onEdit}
            onAddChild={onAddChild}
            onToggleActive={onToggleActive}
          />
        ))}

      {/* Empty children state */}
      {isExpanded && !isLoadingChildren && children.length === 0 && hasChildren && (
        <tr>
          <td colSpan={6} style={{ paddingLeft: `${level * 32 + 16}px` }} className="py-3">
            <span className="text-sm text-gray-400 italic">Tidak ada sub-klasifikasi.</span>
          </td>
        </tr>
      )}
    </>
  );
}

export default function ClassificationsPage() {
  const {
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
    toggleExpand,
    handleCreate,
    handleUpdate,
    handleToggleActive,
  } = useClassifications();

  // === Filter state ===
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // === Modal state ===
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingParentId, setEditingParentId] = useState(null);
  const [addingParent, setAddingParent] = useState(null); // parent saat tambah child

  // === Confirm dialog state ===
  const [showConfirm, setShowConfirm] = useState(false);
  const [togglingItem, setTogglingItem] = useState(null);
  const [togglingParentId, setTogglingParentId] = useState(null);

  // === Form state ===
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'substantif',
  });
  const [formErrors, setFormErrors] = useState({});

  // === Notifikasi ===
  const [successMessage, setSuccessMessage] = useState(null);

  // Build filter params
  const buildParams = useCallback(() => {
    const params = {};
    if (typeFilter) params.type = typeFilter;
    if (statusFilter) params.is_active = statusFilter;
    return params;
  }, [typeFilter, statusFilter]);

  // Fetch roots saat mount
  useEffect(() => {
    fetchRoots(buildParams());
  }, [fetchRoots, buildParams]);

  // Handler filter
  const handleFilter = () => {
    fetchRoots(buildParams());
  };

  const handleResetFilter = () => {
    setTypeFilter('');
    setStatusFilter('');
    fetchRoots({});
  };

  // === Validasi Form ===
  const validateForm = () => {
    const errors = {};

    if (!formData.code.trim()) {
      errors.code = 'Kode wajib diisi.';
    }

    if (!formData.name.trim()) {
      errors.name = 'Nama wajib diisi.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // === Handler Tambah Child ===
  const openAddChildModal = (parent) => {
    setAddingParent(parent);
    setFormData({
      code: '',
      name: '',
      type: parent.type || 'substantif', // inherit type dari parent
    });
    setFormErrors({});
    setActionError(null);
    setShowAddModal(true);
  };

  // Handler Tambah Root
  const openAddRootModal = () => {
    setAddingParent(null);
    setFormData({
      code: '',
      name: '',
      type: 'substantif',
    });
    setFormErrors({});
    setActionError(null);
    setShowAddModal(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const parentLevel = addingParent ? (addingParent.level || 1) : 0;
    const childLevel = parentLevel + 1;

    try {
      await handleCreate({
        code: formData.code.trim(),
        name: formData.name.trim(),
        type: formData.type,
        parent_id: addingParent?.id || null,
        level: childLevel,
      });
      setShowAddModal(false);
      setAddingParent(null);
      setSuccessMessage('Klasifikasi baru berhasil dibuat.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      // Error sudah di-handle oleh hook
    }
  };

  // === Handler Edit ===
  const openEditModal = (item, parentId) => {
    setEditingItem(item);
    setEditingParentId(parentId);
    setFormData({
      code: item.code || '',
      name: item.name || '',
      type: item.type || 'substantif',
    });
    setFormErrors({});
    setActionError(null);
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!editingItem) return;

    try {
      await handleUpdate(editingItem.id, {
        code: formData.code.trim(),
        name: formData.name.trim(),
        type: formData.type,
        parent_id: editingParentId || null,
      });
      setShowEditModal(false);
      setEditingItem(null);
      setEditingParentId(null);
      setSuccessMessage('Klasifikasi berhasil diperbarui.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      // Error sudah di-handle oleh hook
    }
  };

  // === Handler Toggle Active ===
  const openToggleConfirm = (item, parentId) => {
    setTogglingItem(item);
    setTogglingParentId(parentId);
    setShowConfirm(true);
  };

  const handleConfirmToggle = async () => {
    if (!togglingItem) return;

    try {
      await handleToggleActive(togglingItem.id, togglingParentId);
      setShowConfirm(false);
      setTogglingItem(null);
      setTogglingParentId(null);
      setSuccessMessage('Status klasifikasi berhasil diubah.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setShowConfirm(false);
    }
  };

  // === Handler input form ===
  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const inputBaseClass = `
    block w-full rounded-lg border border-gray-300 bg-white
    px-3 py-2 text-sm text-gray-900
    shadow-sm transition-colors
    focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none
  `;

  // === Render form fields ===
  const renderFormFields = () => (
    <div className="space-y-4">
      {/* Kode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kode <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.code}
          onChange={handleInputChange('code')}
          placeholder="Contoh: 100, 100.1, 100.1.1"
          className={formErrors.code
            ? inputBaseClass.replace('border-gray-300', 'border-red-300').replace('bg-white', 'bg-red-50')
            : inputBaseClass
          }
        />
        {formErrors.code && (
          <p className="mt-1 text-xs text-red-600">{formErrors.code}</p>
        )}
      </div>

      {/* Nama */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nama <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={handleInputChange('name')}
          placeholder="Nama klasifikasi"
          className={formErrors.name
            ? inputBaseClass.replace('border-gray-300', 'border-red-300').replace('bg-white', 'bg-red-50')
            : inputBaseClass
          }
        />
        {formErrors.name && (
          <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
        )}
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipe
        </label>
        <select
          value={formData.type}
          onChange={handleInputChange('type')}
          className={inputBaseClass}
        >
          <option value="substantif">Substantif</option>
          <option value="fasilitatif">Fasilitatif</option>
        </select>
      </div>

      {/* Info parent jika tambah child */}
      {addingParent && showAddModal && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
          <p className="text-xs font-medium text-blue-600 mb-1">Parent</p>
          <p className="text-sm text-blue-800 font-mono">
            {addingParent.code} — {addingParent.name}
          </p>
        </div>
      )}

      {/* Action error dari API */}
      {actionError && <ErrorMessage error={actionError} />}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🗂️ Klasifikasi Surat</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola hierarki klasifikasi surat dalam format tree (Level 1 → 2 → 3).
          </p>
        </div>

        <Button variant="primary" size="md" onClick={openAddRootModal}>
          + Tambah Root
        </Button>
      </div>

      {/* Notifikasi sukses */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <svg
            className="h-5 w-5 text-emerald-500 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <p className="text-sm text-emerald-700">{successMessage}</p>
        </div>
      )}

      {/* Filter card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Tipe Klasifikasi
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={inputBaseClass}
            >
              <option value="">Semua</option>
              <option value="substantif">Substantif</option>
              <option value="fasilitatif">Fasilitatif</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={inputBaseClass}
            >
              <option value="">Semua</option>
              <option value="1">Aktif</option>
              <option value="0">Nonaktif</option>
            </select>
          </div>

          {/* Filter actions */}
          <div className="flex gap-2">
            <Button variant="primary" size="md" onClick={handleFilter}>
              Filter
            </Button>
            <Button variant="secondary" size="md" onClick={handleResetFilter}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && <ErrorMessage error={error} />}

      {/* Tree table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-56">
                Kode
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Nama
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
                Tipe
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                Level
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-48">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Loading state */}
            {loading && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <LoadingSpinner size="md" />
                    <span className="text-sm text-gray-400">Memuat klasifikasi...</span>
                  </div>
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!loading && roots.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                  Tidak ada data klasifikasi.
                </td>
              </tr>
            )}

            {/* Tree rows */}
            {!loading &&
              roots.map((root) => (
                <TreeRow
                  key={root.id}
                  item={root}
                  level={1}
                  parentId={null}
                  expandedIds={expandedIds}
                  childrenMap={childrenMap}
                  loadingChildrenIds={loadingChildrenIds}
                  onToggleExpand={toggleExpand}
                  onEdit={openEditModal}
                  onAddChild={openAddChildModal}
                  onToggleActive={openToggleConfirm}
                />
              ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
          Level 1
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
          Level 2
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
          Level 3
        </div>
      </div>

      {/* Modal Tambah Klasifikasi */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setAddingParent(null);
        }}
        title={addingParent ? `Tambah Sub-Klasifikasi (${addingParent.code})` : 'Tambah Klasifikasi Root'}
        size="md"
      >
        <form onSubmit={handleSubmitAdd}>
          {renderFormFields()}
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setShowAddModal(false);
                setAddingParent(null);
              }}
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              loading={actionLoading}
            >
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Klasifikasi */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
          setEditingParentId(null);
        }}
        title={`Edit Klasifikasi — ${editingItem?.code || ''}`}
        size="md"
      >
        <form onSubmit={handleSubmitEdit}>
          {renderFormFields()}
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setShowEditModal(false);
                setEditingItem(null);
                setEditingParentId(null);
              }}
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              loading={actionLoading}
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog Toggle Active */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setTogglingItem(null);
          setTogglingParentId(null);
        }}
        onConfirm={handleConfirmToggle}
        title={togglingItem?.is_active ? 'Nonaktifkan Klasifikasi' : 'Aktifkan Klasifikasi'}
        message={
          togglingItem?.is_active
            ? `Apakah Anda yakin ingin menonaktifkan klasifikasi "${togglingItem?.code} — ${togglingItem?.name}"? Klasifikasi nonaktif tidak dapat dipilih di form pembuatan surat.`
            : `Apakah Anda yakin ingin mengaktifkan kembali klasifikasi "${togglingItem?.code} — ${togglingItem?.name}"?`
        }
        confirmLabel={togglingItem?.is_active ? 'Nonaktifkan' : 'Aktifkan'}
        loading={actionLoading}
      />
    </div>
  );
}
