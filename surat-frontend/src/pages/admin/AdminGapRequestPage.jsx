import { useState, useEffect } from 'react';
import { useAdminGapRequests } from '../../hooks/useAdminGapRequests';
import { useToast } from '../../hooks/useToast';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';
import StatusChip from '../../components/ui/StatusChip';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';
import ErrorMessage from '../../components/ui/ErrorMessage';

/**
 * AdminGapRequestPage — Halaman kelola gap request (admin).
 *
 * Fitur:
 * - Tab: Pending | Disetujui | Ditolak | Semua
 * - Tabel per tab: Tanggal | User | Klasifikasi | Tanggal Gap | Alasan | Status | Nomor | Aksi
 * - Aksi Pending: Setujui (ConfirmDialog → notif nomor) | Tolak (Modal + input alasan)
 *
 * Tab bekerja tanpa reload halaman — hanya re-fetch data dengan parameter status berbeda.
 */

// Definisi tab yang tersedia
const TABS = [
  { key: 'pending', label: 'Pending', status: 'pending' },
  { key: 'approved', label: 'Disetujui', status: 'approved' },
  { key: 'rejected', label: 'Ditolak', status: 'rejected' },
  { key: 'all', label: 'Semua', status: '' },
];

export default function AdminGapRequestPage() {
  const {
    requests,
    loading,
    error,
    meta,
    fetchAllRequests,
    approveRequest,
    rejectRequest,
    refetch,
  } = useAdminGapRequests();
  const toast = useToast();

  // === Tab state ===
  const [activeTab, setActiveTab] = useState('pending');

  // === Pagination state ===
  const [currentPage, setCurrentPage] = useState(1);

  // === Approve dialog state ===
  const [approveTarget, setApproveTarget] = useState(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const [approveError, setApproveError] = useState(null);

  // === Reject modal state ===
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectError, setRejectError] = useState(null);

  // === Detail modal state ===
  const [viewTarget, setViewTarget] = useState(null);

  // Ambil status dari tab aktif
  const currentStatus = TABS.find((t) => t.key === activeTab)?.status || '';

  // Fetch data saat tab atau page berubah
  useEffect(() => {
    const params = { page: currentPage };
    if (currentStatus) params.status = currentStatus;
    fetchAllRequests(params);
  }, [fetchAllRequests, currentPage, currentStatus]);

  // Handler ganti tab (tanpa reload halaman)
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setCurrentPage(1);
  };

  // Handler ganti halaman
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // === APPROVE FLOW ===
  const handleApproveConfirm = async () => {
    if (!approveTarget) return;

    setApproveLoading(true);
    setApproveError(null);

    try {
      const response = await approveRequest(approveTarget.id);

      // Gunakan formatted_number dari resource yang baru saja ditambahkan
      const issuedNumber = response.data?.formatted_number || response.data?.number || 'N/A';

      toast.success(
        `Gap request disetujui! Nomor diterbitkan: ${issuedNumber}`
      );

      setApproveTarget(null);
      refetch();
    } catch (err) {
      setApproveError(err.message);
      toast.error('Gagal menyetujui gap request.');
    } finally {
      setApproveLoading(false);
    }
  };

  // === REJECT FLOW ===
  const handleRejectSubmit = async () => {
    if (!rejectTarget) return;

    // Validasi alasan
    if (!rejectReason.trim()) {
      setRejectError('Alasan penolakan wajib diisi.');
      return;
    }
    if (rejectReason.trim().length < 5) {
      setRejectError('Alasan penolakan minimal 5 karakter.');
      return;
    }

    setRejectLoading(true);
    setRejectError(null);

    try {
      await rejectRequest(rejectTarget.id, rejectReason.trim());

      toast.success('Gap request berhasil ditolak.');
      setRejectTarget(null);
      setRejectReason('');
      refetch();
    } catch (err) {
      setRejectError(err.message);
      toast.error('Gagal menolak gap request.');
    } finally {
      setRejectLoading(false);
    }
  };

  // Kolom tabel
  const columns = [
    {
      key: 'created_at',
      label: 'Tanggal',
      render: (value) => {
        if (!value) return '-';
        const date = new Date(value);
        return (
          <span className="text-xs text-[#64748B]">
            {date.toLocaleDateString('id-ID', {
              weekday: 'long',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        );
      },
    },
    {
      key: 'requested_by',
      label: 'User',
      render: (value) => (
        <span className="font-medium text-[#0B1F3A] text-xs">
          {value?.name || '-'}
        </span>
      ),
    },
    {
      key: 'classification',
      label: 'Klasifikasi',
      render: (value) => (
        <span className="bg-[#EBF4FD] text-[#185FA5] px-2 py-0.5 rounded text-xs font-medium">
          {value?.code || '-'}
        </span>
      ),
    },
    {
      key: 'subject',
      label: 'Perihal',
      render: (value) => (
        <span className="max-w-[150px] truncate block text-xs text-[#0B1F3A]" title={value}>
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'destination',
      label: 'Tujuan',
      render: (value) => (
        <span className="max-w-[150px] truncate block text-xs text-[#0B1F3A]" title={value}>
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'gap_date',
      label: 'Tanggal Gap',
      render: (value) => {
        if (!value) return '-';
        const date = new Date(value + 'T00:00:00');
        return (
          <span className="text-xs text-[#64748B]">
            {date.toLocaleDateString('id-ID', {
              weekday: 'long',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        );
      },
    },
    {
      key: 'reason',
      label: 'Alasan',
      render: (value) => (
        <span className="max-w-[200px] truncate block text-xs text-[#64748B]" title={value}>
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusChip status={value} />,
    },
    {
      key: 'number',
      label: 'Urutan',
      render: (value, row) => {
        if (row.status === 'approved' && value) {
          return (
            <span className="font-semibold text-[#2A7FD4] font-mono text-xs">
              {value}
            </span>
          );
        }
        return <span className="text-[#94A3B8] text-xs">-</span>;
      },
    },
    {
      key: 'formatted_number',
      label: 'Nomor Surat',
      render: (value, row) => {
        if (row.status === 'approved' && value) {
          return (
            <span className="font-bold text-[#0B1F3A] font-mono text-xs whitespace-nowrap">
              {value}
            </span>
          );
        }
        return <span className="text-[#94A3B8] text-xs">-</span>;
      },
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_value, row) => {
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="!bg-blue-50 !text-blue-700 !border-blue-100 hover:!bg-blue-100"
              onClick={() => setViewTarget(row)}
            >
              Detail
            </Button>

            {row.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="!bg-emerald-50 !text-emerald-700 !border-emerald-100 hover:!bg-emerald-100"
                  onClick={() => {
                    setApproveError(null);
                    setApproveTarget(row);
                  }}
                >
                  Setujui
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="!bg-red-50 !text-red-700 !border-red-100 hover:!bg-red-100"
                  onClick={() => {
                    setRejectError(null);
                    setRejectReason('');
                    setRejectTarget(row);
                  }}
                >
                  Tolak
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-base font-semibold text-[#0B1F3A]">Kelola Gap Request</h1>
        <p className="mt-0.5 text-sm text-[#64748B]">
          Setujui atau tolak permintaan nomor surat dari zona gap.
        </p>
      </div>

      {/* Tab navigation — bekerja tanpa reload halaman */}
      <div className="border-b border-[#E2E8F0]">
        <nav className="-mb-px flex gap-0" aria-label="Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={`
                  whitespace-nowrap border-b-2 py-2.5 px-4 text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-[#64748B] hover:border-[#E2E8F0] hover:text-[#0B1F3A]'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Error state */}
      {error && <ErrorMessage error={error} />}

      {/* Tabel gap requests */}
      <Table
        columns={columns}
        data={requests}
        loading={loading}
        emptyText="Tidak ada gap request dalam kategori ini."
        emptyIcon="📋"
      />

      {/* Pagination */}
      <Pagination meta={meta} onPageChange={handlePageChange} />

      {/* ============ APPROVE CONFIRM DIALOG ============ */}
      <ConfirmDialog
        isOpen={!!approveTarget}
        onClose={() => {
          setApproveTarget(null);
          setApproveError(null);
        }}
        onConfirm={handleApproveConfirm}
        title="Setujui Gap Request"
        message={
          approveTarget
            ? `Setujui gap request dari "${approveTarget.requested_by?.name || 'User'}" untuk klasifikasi "${
                approveTarget.classification?.code || '-'
              }"? Nomor surat akan diterbitkan dari zona gap.`
            : ''
        }
        confirmLabel="Ya, Setujui"
        loading={approveLoading}
      />

      {/* Approve error (tampil di bawah dialog) */}
      {approveError && !approveTarget && <ErrorMessage error={approveError} />}

      {/* ============ REJECT MODAL ============ */}
      <Modal
        isOpen={!!rejectTarget}
        onClose={() => {
          setRejectTarget(null);
          setRejectReason('');
          setRejectError(null);
        }}
        title="Tolak Gap Request"
        size="md"
      >
        <div className="space-y-4">
          {/* Info request yang ditolak */}
          <div className="bg-[#F7F9FC] rounded-lg p-3 text-xs text-[#64748B]">
            <p>
              <span className="font-medium text-[#0B1F3A]">User:</span>{' '}
              {rejectTarget?.requested_by?.name || '-'}
            </p>
            <p>
              <span className="font-medium text-[#0B1F3A]">Klasifikasi:</span>{' '}
              {rejectTarget?.classification?.code || '-'}
            </p>
          </div>

          {/* Input alasan penolakan */}
          <div>
            <label
              htmlFor="reject_reason"
              className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1"
            >
              Alasan Penolakan <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reject_reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              disabled={rejectLoading}
              rows={3}
              placeholder="Jelaskan alasan penolakan..."
              className={`block w-full min-h-[80px] resize-none rounded-lg border bg-[#F7F9FC] px-3 py-2 text-sm text-[#0B1F3A]
                transition-all duration-200
                focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20
                disabled:bg-[#F7F9FC] disabled:text-[#94A3B8] disabled:cursor-not-allowed ${
                rejectError
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-[#E2E8F0]'
              }`}
            />
          </div>

          {/* Reject error */}
          {rejectError && <ErrorMessage error={rejectError} />}

          {/* Tombol aksi */}
          <div className="flex justify-end gap-3 pt-2 border-t border-[#E2E8F0]">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setRejectTarget(null);
                setRejectReason('');
                setRejectError(null);
              }}
              disabled={rejectLoading}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleRejectSubmit}
              loading={rejectLoading}
            >
              Tolak Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* ============ DETAIL MODAL ============ */}
      <Modal
        isOpen={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="Detail Gap Request"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* SISI KIRI: METADATA (2/5 lebar) */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                  Status Request
                </label>
                <StatusChip status={viewTarget?.status} />
              </div>

              <div className="space-y-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Pemohon
                  </label>
                  <p className="text-sm font-bold text-[#0B1F3A]">{viewTarget?.requested_by?.name || '-'}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{viewTarget?.requested_by?.work_unit || '-'}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Klasifikasi
                  </label>
                  <p className="text-sm font-medium text-[#0B1F3A]">{viewTarget?.classification?.name || '-'}</p>
                  <p className="text-xs font-mono text-[#185FA5] bg-[#EBF4FD] inline-block px-1.5 py-0.5 rounded mt-1">
                    {viewTarget?.classification?.code || '-'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Waktu Pengajuan
                  </label>
                  <p className="text-xs text-[#0B1F3A]">
                    {viewTarget?.created_at ? new Date(viewTarget.created_at).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Tanggal Gap
                  </label>
                  <p className="text-xs text-[#0B1F3A]">
                    {viewTarget?.gap_date ? new Date(viewTarget.gap_date + 'T00:00:00').toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    }) : '-'}
                  </p>
                </div>
                {viewTarget?.status === 'approved' && (
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">
                      Nomor Diterbitkan
                    </label>
                    <p className="text-sm font-bold text-emerald-700 font-mono">{viewTarget?.formatted_number || '-'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* SISI KANAN: KONTEN SURAT (3/5 lebar) */}
            <div className="md:col-span-3 space-y-5 border-l border-[#E2E8F0] md:pl-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                  Perihal
                </label>
                <div className="text-sm font-semibold text-[#0B1F3A] leading-relaxed">
                  {viewTarget?.subject || '-'}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                  Tujuan
                </label>
                <div className="text-sm text-[#0B1F3A]">
                  {viewTarget?.destination || '-'}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                  Alasan Pengajuan
                </label>
                <div className="text-sm text-[#64748B] bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] whitespace-pre-wrap italic">
                  "{viewTarget?.reason || '-'}"
                </div>
              </div>

              {viewTarget?.status === 'rejected' && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 mt-4">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-red-600 mb-1">
                    Catatan Penolakan
                  </label>
                  <p className="text-sm text-red-800 font-medium italic">
                    "{viewTarget?.rejection_reason || 'Tidak ada alasan spesifik.'}"
                  </p>
                  <div className="mt-3 pt-3 border-t border-red-100 flex justify-between items-center text-[10px] text-red-400">
                    <span>Reviewer: {viewTarget?.reviewed_by?.name || 'Admin'}</span>
                    <span>{viewTarget?.reviewed_at}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#E2E8F0]">
            <Button variant="outline" size="md" onClick={() => setViewTarget(null)}>
              Tutup
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
