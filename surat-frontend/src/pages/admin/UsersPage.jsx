import { useState, useEffect, useCallback } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { useToast } from '../../hooks/useToast';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ErrorMessage from '../../components/ui/ErrorMessage';

/**
 * UsersPage — Halaman admin: kelola user.
 *
 * Fitur:
 * - Tabel: Nama | Email | Divisi | Role | Status | Aksi
 * - Aksi per baris: Edit (modal), Toggle aktif/nonaktif (ConfirmDialog)
 * - Tombol "Tambah User" → Modal form tambah
 * - Filter: search nama/email, filter role, filter status
 */
export default function UsersPage() {
  const {
    users,
    loading,
    error,
    meta,
    actionLoading,
    actionError,
    setActionError,
    fetchUsers,
    handleCreateUser,
    handleUpdateUser,
    handleToggleActive,
  } = useUsers();
  const toast = useToast();

  // === Filter state ===
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // === Modal state ===
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // === Confirm dialog state ===
  const [showConfirm, setShowConfirm] = useState(false);
  const [togglingUser, setTogglingUser] = useState(null);

  // === Form state (tambah & edit) ===
  const [formData, setFormData] = useState({
    name: '',
    nip: '',
    email: '',
    password: '',
    password_confirmation: '',
    division: '',
    role: 'user',
  });
  const [formErrors, setFormErrors] = useState({});

  // Build params dari filter
  const buildParams = useCallback(
    (page = 1) => {
      const params = { page };
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.is_active = statusFilter;
      return params;
    },
    [search, roleFilter, statusFilter]
  );

  // Fetch data saat mount dan saat filter/page berubah
  useEffect(() => {
    fetchUsers(buildParams(currentPage));
  }, [fetchUsers, buildParams, currentPage]);

  // Handler ganti halaman
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handler apply filter
  const handleFilter = () => {
    setCurrentPage(1);
    fetchUsers(buildParams(1));
  };

  // Handler reset filter
  const handleResetFilter = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setCurrentPage(1);
    fetchUsers({ page: 1 });
  };

  // === Validasi Form ===
  const validateForm = (isEdit = false) => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Nama wajib diisi.';
    }

    if (!formData.nip.trim()) {
      errors.nip = 'NIP wajib diisi.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email wajib diisi.';
    } else {
      // Validasi format email sederhana
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Format email tidak valid.';
      }
    }

    // Password wajib hanya saat tambah user baru
    if (!isEdit) {
      if (!formData.password) {
        errors.password = 'Password wajib diisi.';
      } else if (formData.password.length < 8) {
        errors.password = 'Password minimal 8 karakter.';
      }

      if (formData.password !== formData.password_confirmation) {
        errors.password_confirmation = 'Konfirmasi password tidak cocok.';
      }
    }

    if (!formData.division.trim()) {
      errors.division = 'Divisi wajib diisi.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // === Handler Tambah User ===
  const openAddModal = () => {
    setFormData({
      name: '',
      nip: '',
      email: '',
      password: '',
      password_confirmation: '',
      division: '',
      role: 'user',
    });
    setFormErrors({});
    setActionError(null);
    setShowAddModal(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!validateForm(false)) return;

    try {
      await handleCreateUser({
        name: formData.name.trim(),
        nip: formData.nip.trim(),
        email: formData.email.trim(),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        division: formData.division.trim(),
        role: formData.role,
      });
      setShowAddModal(false);
      toast.success('User baru berhasil dibuat.');
    } catch {
      toast.error('Gagal membuat user baru.');
    }
  };

  // === Handler Edit User ===
  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      nip: user.nip || '',
      email: user.email || '',
      password: '',
      password_confirmation: '',
      division: user.division || '',
      role: user.role || 'user',
    });
    setFormErrors({});
    setActionError(null);
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) return;
    if (!editingUser) return;

    try {
      await handleUpdateUser(editingUser.id, {
        name: formData.name.trim(),
        nip: formData.nip.trim(),
        email: formData.email.trim(),
        division: formData.division.trim(),
        role: formData.role,
      });
      setShowEditModal(false);
      setEditingUser(null);
      toast.success('Data user berhasil diperbarui.');
    } catch {
      toast.error('Gagal memperbarui data user.');
    }
  };

  // === Handler Toggle Aktif ===
  const openToggleConfirm = (user) => {
    setTogglingUser(user);
    setShowConfirm(true);
  };

  const handleConfirmToggle = async () => {
    if (!togglingUser) return;

    try {
      await handleToggleActive(togglingUser.id);
      setShowConfirm(false);
      setTogglingUser(null);
      toast.success('Status user berhasil diubah.');
    } catch {
      toast.error('Gagal mengubah status user.');
      setShowConfirm(false);
    }
  };

  // === Handler input form ===
  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Hapus error saat user mulai mengetik
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // === Kolom tabel ===
  const columns = [
    {
      key: 'name',
      label: 'Nama',
      render: (value) => (
        <span className="font-medium text-[#0B1F3A] text-xs">{value || '-'}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (value) => (
        <span className="text-xs text-[#64748B]">{value || '-'}</span>
      ),
    },
    {
      key: 'nip',
      label: 'NIP',
      render: (value) => (
        <span className="text-xs text-[#64748B]">{value || '-'}</span>
      ),
    },
    {
      key: 'division',
      label: 'Divisi',
      render: (value) => (
        <span className="text-xs text-[#64748B]">{value || '-'}</span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (value) => (
        <Badge variant={value === 'admin' ? 'info' : 'default'}>
          {value === 'admin' ? 'Admin' : 'User'}
        </Badge>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditModal(row)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={row.is_active ? '!bg-red-50 !text-red-700 !border-red-100 hover:!bg-red-100' : '!bg-emerald-50 !text-emerald-700 !border-emerald-100 hover:!bg-emerald-100'}
            onClick={() => openToggleConfirm(row)}
          >
            {row.is_active ? 'Nonaktifkan' : 'Aktifkan'}
          </Button>
        </div>
      ),
    },
  ];

  const inputBaseClass = `
    block w-full h-9 rounded-lg border border-[#E2E8F0] bg-[#F7F9FC]
    px-3 text-sm text-[#0B1F3A]
    transition-all duration-200
    focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20
  `;

  const inputErrorClass = `
    block w-full h-9 rounded-lg border border-red-300 bg-[#FEF2F2]
    px-3 text-sm text-[#0B1F3A]
    transition-all duration-200
    focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/20
  `;

  // === Render form fields (shared antara add & edit) ===
  const renderFormFields = (isEdit = false) => (
    <div className="space-y-4">
      {/* Nama */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">
          Nama <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={handleInputChange('name')}
          placeholder="Masukkan nama lengkap"
          className={formErrors.name ? inputErrorClass : inputBaseClass}
        />
        {formErrors.name && (
          <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">
          NIP <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.nip}
          onChange={handleInputChange('nip')}
          placeholder="Masukkan NIP"
          className={formErrors.nip ? inputErrorClass : inputBaseClass}
        />
        {formErrors.nip && (
          <p className="mt-1 text-xs text-red-600">{formErrors.nip}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          placeholder="contoh@email.com"
          className={formErrors.email ? inputErrorClass : inputBaseClass}
        />
        {formErrors.email && (
          <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
        )}
      </div>

      {/* Password — hanya tampil saat tambah user baru */}
      {!isEdit && (
        <>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              placeholder="Minimal 8 karakter"
              className={formErrors.password ? inputErrorClass : inputBaseClass}
            />
            {formErrors.password && (
              <p className="mt-1 text-xs text-red-600">{formErrors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">
              Konfirmasi Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.password_confirmation}
              onChange={handleInputChange('password_confirmation')}
              placeholder="Ulangi password"
              className={formErrors.password_confirmation ? inputErrorClass : inputBaseClass}
            />
            {formErrors.password_confirmation && (
              <p className="mt-1 text-xs text-red-600">{formErrors.password_confirmation}</p>
            )}
          </div>
        </>
      )}

      {/* Divisi */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">
          Divisi <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.division}
          onChange={handleInputChange('division')}
          placeholder="Nama divisi"
          className={formErrors.division ? inputErrorClass : inputBaseClass}
        />
        {formErrors.division && (
          <p className="mt-1 text-xs text-red-600">{formErrors.division}</p>
        )}
      </div>

      {/* Role */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">
          Role
        </label>
        <select
          value={formData.role}
          onChange={handleInputChange('role')}
          className={inputBaseClass}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Action error dari API */}
      {actionError && <ErrorMessage error={actionError} />}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-base font-semibold text-[#0B1F3A]">Kelola User</h1>
          <p className="mt-0.5 text-sm text-[#64748B]">
            Kelola akun user, ubah role, dan atur status aktif/nonaktif.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={openAddModal}>
          + Tambah User
        </Button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-3">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-start sm:items-end">
          {/* Search */}
          <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[180px]">
            <label className="block text-[10px] font-medium text-[#64748B] uppercase tracking-wide mb-1">
              Cari Nama / Email
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ketik nama atau email..."
              className={inputBaseClass}
            />
          </div>

          {/* Role */}
          <div className="w-full sm:w-32">
            <label className="block text-[10px] font-medium text-[#64748B] uppercase tracking-wide mb-1">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={inputBaseClass}
            >
              <option value="">Semua</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
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

          <div className="flex gap-2 pt-1">
            <Button variant="primary" size="sm" onClick={handleFilter}>
              Filter
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetFilter}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && <ErrorMessage error={error} />}

      {/* Tabel user */}
      <Table
        columns={columns}
        data={users}
        loading={loading}
        emptyText="Belum ada user terdaftar."
        emptyIcon="👥"
      />

      {/* Pagination */}
      <Pagination meta={meta} onPageChange={handlePageChange} />

      {/* Modal Tambah User */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah User Baru"
        size="md"
      >
        <form onSubmit={handleSubmitAdd}>
          {renderFormFields(false)}
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-[#E2E8F0]">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowAddModal(false)}
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

      {/* Modal Edit User */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingUser(null);
        }}
        title="Edit User"
        size="md"
      >
        <form onSubmit={handleSubmitEdit}>
          {renderFormFields(true)}
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-[#E2E8F0]">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setShowEditModal(false);
                setEditingUser(null);
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

      {/* Confirm Dialog Toggle Aktif */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setTogglingUser(null);
        }}
        onConfirm={handleConfirmToggle}
        title={togglingUser?.is_active ? 'Nonaktifkan User' : 'Aktifkan User'}
        message={
          togglingUser?.is_active
            ? `Apakah Anda yakin ingin menonaktifkan user "${togglingUser?.name}"? User yang nonaktif tidak dapat login ke sistem.`
            : `Apakah Anda yakin ingin mengaktifkan kembali user "${togglingUser?.name}"?`
        }
        confirmLabel={togglingUser?.is_active ? 'Nonaktifkan' : 'Aktifkan'}
        loading={actionLoading}
      />
    </div>
  );
}
