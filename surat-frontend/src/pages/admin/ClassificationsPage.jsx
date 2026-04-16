import { useState, useEffect, useCallback } from 'react';
import { useClassifications } from '../../hooks/useClassifications';
import { useToast } from '../../hooks/useToast';
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
 * - Tree view: Level 1 → expand Level 2 → expand Level 3 → expand Level 4
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

  // Level 4 tidak bisa punya child lagi
  const canAddChild = (item.level || level) < 4;

  // Indentasi berdasarkan level
  const paddingLeft = `${(level - 1) * 32 + 16}px`;

  return (
    <>
      <tr className="hover:bg-[#F7F9FC] transition-colors border-b border-[#E2E8F0]">
        {/* Kode — dengan expand/collapse toggle */}
        <td className="py-2 text-xs text-[#0B1F3A] whitespace-nowrap" style={{ paddingLeft }}>
          <div className="flex items-center gap-2">
            {/* Expand/collapse button */}
            {hasChildren || canAddChild ? (
              <button
                type="button"
                onClick={() => onToggleExpand(item.id)}
                className={`
                  flex items-center justify-center h-6 w-6 rounded-md text-[#94A3B8]
                  hover:bg-[#F7F9FC] hover:text-[#0B1F3A] transition-all duration-200
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
                  ? 'bg-[#0B1F3A]'
                  : level === 2
                  ? 'bg-[#2A7FD4]'
                  : level === 3
                  ? 'bg-[#94A3B8]'
                  : 'bg-[#64748B]'
              }`}
            />

            <span className="font-mono font-semibold text-[#0B1F3A]">
              {item.code}
            </span>
          </div>
        </td>

        {/* Nama */}
        <td className="px-3 py-2 text-xs text-[#0B1F3A]">
          {item.name}
        </td>

        {/* Type */}
        <td className="px-3 py-2 text-xs">
          <Badge variant={item.type === 'substantif' ? 'info' : 'warning'}>
            {item.type === 'substantif' ? 'Substantif' : 'Fasilitatif'}
          </Badge>
        </td>

        {/* Level */}
        <td className="px-3 py-2 text-xs text-center">
          <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-[#F7F9FC] text-[#64748B] text-[10px] font-semibold">
            {item.level || level}
          </span>
        </td>

        {/* Status */}
        <td className="px-3 py-2 text-xs">
          <Badge variant={item.is_active ? 'success' : 'danger'}>
            {item.is_active ? 'Aktif' : 'Nonaktif'}
          </Badge>
        </td>

        {/* Aksi */}
        <td className="px-3 py-2 text-xs whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(item, parentId)}
              className="bg-[#EBF4FD] text-[#185FA5] border-0 rounded px-2 py-1 text-xs font-medium hover:bg-[#D6EBFC] transition-colors"
            >
              Edit
            </button>
            {canAddChild && (
              <button
                type="button"
                onClick={() => onAddChild(item)}
                className="bg-[#EBF4FD] text-[#185FA5] border-0 rounded px-2 py-1 text-xs font-medium hover:bg-[#D6EBFC] transition-colors"
              >
                + Child
              </button>
            )}
            <button
              type="button"
              onClick={() => onToggleActive(item, parentId)}
              className={`border-0 rounded px-2 py-1 text-xs font-medium transition-colors ${
                item.is_active
                  ? 'bg-[#FEF2F2] text-[#991B1B] hover:bg-red-100'
                  : 'bg-[#ECFDF5] text-[#065F46] hover:bg-emerald-100'
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
            <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
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
            <span className="text-xs text-[#94A3B8] italic">Tidak ada sub-klasifikasi.</span>
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
  const toast = useToast();

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
      toast.success('Klasifikasi baru berhasil dibuat.');
    } catch {
      toast.error('Gagal membuat klasifikasi.');
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
        level: editingItem.level,
      });
      setShowEditModal(false);
      setEditingItem(null);
      setEditingParentId(null);
      toast.success('Klasifikasi berhasil diperbarui.');
    } catch {
      toast.error('Gagal memperbarui klasifikasi.');
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
      toast.success('Status klasifikasi berhasil diubah.');
    } catch {
      toast.error('Gagal mengubah status klasifikasi.');
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
    block w-full h-9 rounded-lg border border-[#E2E8F0] bg-[#F7F9FC]
    px-3 text-sm text-[#0B1F3A]
    transition-all duration-200
    focus:border-[#2A7FD4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2A7FD4]/20
  `;

  // === Render form fields ===
  const renderFormFields = () => (
    <div className="space-y-4">
      {/* Kode */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">
          Kode <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.code}
          onChange={handleInputChange('code')}
          placeholder="Contoh: 100, 100.1, 100.1.1, 100.1.1.1"
          className={formErrors.code
            ? inputBaseClass.replace('border-[#E2E8F0]', 'border-red-300').replace('bg-[#F7F9FC]', 'bg-[#FEF2F2]')
            : inputBaseClass
          }
        />
        {formErrors.code && (
          <p className="mt-1 text-xs text-red-600">{formErrors.code}</p>
        )}
      </div>

      {/* Nama */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">
          Nama <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={handleInputChange('name')}
          placeholder="Nama klasifikasi"
          className={formErrors.name
            ? inputBaseClass.replace('border-[#E2E8F0]', 'border-red-300').replace('bg-[#F7F9FC]', 'bg-[#FEF2F2]')
            : inputBaseClass
          }
        />
        {formErrors.name && (
          <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
        )}
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">
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
        <div className="rounded-lg bg-[#EBF4FD] border border-[#2A7FD4]/10 px-3 py-2">
          <p className="text-[10px] font-medium text-[#2A7FD4] uppercase tracking-wide mb-0.5">Parent</p>
          <p className="text-xs text-[#0B1F3A] font-mono">
            {addingParent.code} — {addingParent.name}
          </p>
        </div>
      )}

      {/* Action error dari API */}
      {actionError && <ErrorMessage error={actionError} />}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-base font-semibold text-[#0B1F3A]">Klasifikasi Surat</h1>
          <p className="mt-0.5 text-sm text-[#64748B]">
            Kelola hierarki klasifikasi surat dalam format tree (Level 1 → 2 → 3 → 4).
          </p>
        </div>

        <Button variant="primary" size="md" onClick={openAddRootModal}>
          + Tambah Root
        </Button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-3">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-start sm:items-end">
          {/* Type */}
          <div className="w-full sm:w-40">
            <label className="block text-[10px] font-medium text-[#64748B] uppercase tracking-wide mb-1">
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
          <div className="w-full sm:w-32">
            <label className="block text-[10px] font-medium text-[#64748B] uppercase tracking-wide mb-1">
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
          <div className="flex gap-2 pt-1">
            <button onClick={handleFilter} className="bg-[#2A7FD4] text-white rounded-lg h-9 px-4 text-xs font-semibold hover:bg-[#2571BF] transition-colors">
              Filter
            </button>
            <button onClick={handleResetFilter} className="border border-[#E2E8F0] rounded-lg h-9 px-4 text-xs text-[#64748B] hover:bg-[#F7F9FC] transition-colors">
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && <ErrorMessage error={error} />}

      {/* Tree table */}
      <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white">
        <table className="min-w-full">
          <thead>
            <tr className="bg-[#F7F9FC]">
              <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#64748B] uppercase tracking-widest w-56">
                Kode
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#64748B] uppercase tracking-widest">
                Nama
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#64748B] uppercase tracking-widest w-28">
                Tipe
              </th>
              <th className="px-3 py-2 text-center text-[10px] font-semibold text-[#64748B] uppercase tracking-widest w-16">
                Level
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#64748B] uppercase tracking-widest w-24">
                Status
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#64748B] uppercase tracking-widest w-48">
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
                    <span className="text-xs text-[#94A3B8]">Memuat klasifikasi...</span>
                  </div>
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!loading && roots.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#F7F9FC] mb-3">
                    <span className="text-2xl">🗂️</span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Belum ada data klasifikasi. Klik '+ Tambah Root' untuk memulai.
                  </p>
                </div>
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
      <div className="flex items-center gap-6 text-[10px] text-[#94A3B8]">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-[#0B1F3A]" />
          Level 1
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-[#2A7FD4]" />
          Level 2
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-[#94A3B8]" />
          Level 3
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-[#64748B]" />
          Level 4
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
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-[#E2E8F0]">
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
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-[#E2E8F0]">
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
