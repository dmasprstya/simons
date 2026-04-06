import { useState, useEffect } from 'react';
import { displayLetterNumber } from '../../utils/formatNumber';
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

      // Ambil nomor terformat dari response — gunakan displayLetterNumber jika letter tersedia
      const letterData = response.data?.letter;
      const issuedNumber = letterData
        ? displayLetterNumber(letterData)
        : (response.data?.issued_number || 'N/A');

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
        return date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      },
    },
    {
      key: 'user',
      label: 'User',
      render: (value) => (
        <span className="font-medium text-gray-800">
          {value?.name || '-'}
        </span>
      ),
    },
    {
      key: 'classification',
      label: 'Klasifikasi',
      render: (value) => (
        <span className="text-gray-600">
          {value?.full_code || value?.code || '-'}
        </span>
      ),
    },
    {
      key: 'gap_date',
      label: 'Tanggal Gap',
      render: (value) => {
        if (!value) return '-';
        const date = new Date(value + 'T00:00:00');
        return date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      },
    },
    {
      key: 'reason',
      label: 'Alasan',
      render: (value) => (
        <span className="max-w-[200px] truncate block" title={value}>
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
      key: 'issued_number',
      label: 'Nomor Diterbitkan',
      render: (value, row) => {
        if (row.status === 'approved') {
          // Gunakan formatted_number dari letter jika tersedia
          const displayNumber = row.letter
            ? displayLetterNumber(row.letter)
            : (value || '-');
          return (
            <span className="font-medium text-indigo-600 font-mono">
              {displayNumber}
            </span>
          );
        }
        return <span className="text-gray-400">-</span>;
      },
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_value, row) => {
        // Aksi hanya tersedia di tab Pending
        if (row.status !== 'pending') return null;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setApproveError(null);
                setApproveTarget(row);
              }}
            >
              Setujui
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setRejectError(null);
                setRejectReason('');
                setRejectTarget(row);
              }}
            >
              Tolak
            </Button>
          </div>
        );
      },
    },
  ];

  const inputBaseClass = `
    block w-full rounded-lg border px-3 py-2 text-sm text-gray-900
    shadow-sm transition-colors
    focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
  `;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📋 Kelola Gap Request</h1>
        <p className="mt-1 text-sm text-gray-500">
          Setujui atau tolak permintaan nomor surat dari zona gap.
        </p>
      </div>


      {/* Tab navigation — bekerja tanpa reload halaman */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={`
                  whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors
                  ${
                    isActive
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
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
            ? `Setujui gap request dari "${approveTarget.user?.name || 'User'}" untuk klasifikasi "${
                approveTarget.classification?.full_code || approveTarget.classification?.code || '-'
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
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            <p>
              <span className="font-medium">User:</span>{' '}
              {rejectTarget?.user?.name || '-'}
            </p>
            <p>
              <span className="font-medium">Klasifikasi:</span>{' '}
              {rejectTarget?.classification?.full_code ||
                rejectTarget?.classification?.code ||
                '-'}
            </p>
          </div>

          {/* Input alasan penolakan */}
          <div>
            <label
              htmlFor="reject_reason"
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className={`${inputBaseClass} resize-y ${
                rejectError
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300'
              }`}
            />
          </div>

          {/* Reject error */}
          {rejectError && <ErrorMessage error={rejectError} />}

          {/* Tombol aksi */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button
              variant="secondary"
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
    </div>
  );
}
