import { useState, useEffect, useCallback } from 'react';
import { displayLetterNumber } from '../../utils/formatNumber';
import { useLetters } from '../../hooks/useLetters';
import { useToast } from '../../hooks/useToast';
import ClassificationPicker from '../../components/ui/ClassificationPicker';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';
import StatusChip from '../../components/ui/StatusChip';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ErrorMessage from '../../components/ui/ErrorMessage';

/**
 * MyLettersPage — Halaman riwayat surat milik user.
 *
 * Fitur:
 * - Tabel: Nomor | Klasifikasi | Perihal | Tujuan | Tanggal | Status | Aksi
 * - Filter: date range, classification, reset
 * - Aksi: Batalkan (hanya jika status=active DAN issued_date=hari ini)
 * - Pagination
 */
export default function MyLettersPage() {
  const { letters, loading, error, meta, fetchMyLetters, voidLetter, refetch } =
    useLetters();
  const toast = useToast();

  // Filter state
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [classificationId, setClassificationId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Void dialog state
  const [voidTarget, setVoidTarget] = useState(null);
  const [voidLoading, setVoidLoading] = useState(false);
  const [voidError, setVoidError] = useState(null);

  // Build params dari filter
  const buildParams = useCallback(
    (page = 1) => {
      const params = { page };
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (classificationId) params.classification_id = classificationId;
      return params;
    },
    [dateFrom, dateTo, classificationId]
  );

  // Fetch data saat mount dan saat filter/page berubah
  useEffect(() => {
    fetchMyLetters(buildParams(currentPage));
  }, [fetchMyLetters, buildParams, currentPage]);

  // Handler ganti halaman
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handler apply filter (reset ke page 1)
  const handleFilter = () => {
    setCurrentPage(1);
    fetchMyLetters(buildParams(1));
  };

  // Handler reset filter
  const handleResetFilter = () => {
    setDateFrom('');
    setDateTo('');
    setClassificationId(null);
    setCurrentPage(1);
    fetchMyLetters({ page: 1 });
  };

  // Cek apakah surat bisa dibatalkan: status=active DAN issued_date=hari ini
  const canVoid = (letter) => {
    if (letter.status !== 'active') return false;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return letter.issued_date === today;
  };

  // Handler konfirmasi void
  const handleVoidConfirm = async () => {
    if (!voidTarget) return;

    setVoidLoading(true);
    setVoidError(null);

    try {
      await voidLetter(voidTarget.id);
      setVoidTarget(null);
      toast.success('Surat berhasil dibatalkan.');
      // Refresh tabel
      refetch();
    } catch (err) {
      setVoidError(err.message);
      toast.error('Gagal membatalkan surat.');
    } finally {
      setVoidLoading(false);
    }
  };

  // Kolom tabel
  const columns = [
    {
      key: 'number',
      label: 'Nomor Surat',
      render: (_value, row) => (
        <span className="font-semibold text-[#0B1F3A] font-mono">
          {displayLetterNumber(row)}
        </span>
      ),
    },
    {
      key: 'classification',
      label: 'Klasifikasi',
      render: (value) => (
        <span className="bg-[#EBF4FD] text-[#185FA5] px-2 py-0.5 rounded text-xs font-medium">
          {value?.full_code || value?.code || '-'}
        </span>
      ),
    },
    {
      key: 'subject',
      label: 'Perihal',
      render: (value) => (
        <span className="max-w-[200px] truncate block text-xs text-[#0B1F3A]" title={value}>
          {value}
        </span>
      ),
    },
    {
      key: 'destination',
      label: 'Tujuan',
      render: (value) => (
        <span className="max-w-[150px] truncate block text-xs text-[#64748B]" title={value}>
          {value}
        </span>
      ),
    },
    {
      key: 'issued_date',
      label: 'Tanggal',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusChip status={value} />,
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_value, row) => {
        if (!canVoid(row)) return null;
        return (
          <button
            className="bg-[#FEF2F2] text-[#991B1B] border-0 rounded px-2 py-1 text-xs font-medium hover:bg-red-100 transition-colors"
            onClick={() => {
              setVoidError(null);
              setVoidTarget(row);
            }}
          >
            Batalkan
          </button>
        );
      },
    },
  ];

  const inputBaseClass = `
    block w-full h-9 rounded-lg border border-[#E2E8F0] bg-[#F7F9FC]
    px-3 text-sm text-[#0B1F3A]
    transition-all duration-200
    focus:border-[#2A7FD4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2A7FD4]/20
  `;

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-base font-semibold text-[#0B1F3A]">Riwayat Surat</h1>
        <p className="mt-0.5 text-sm text-[#64748B]">
          Daftar seluruh surat yang pernah Anda ambil.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-3">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-start sm:items-center">
          {/* Date From */}
          <div className="w-full sm:w-36">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="Dari Tanggal"
              className={inputBaseClass}
            />
          </div>

          {/* Date To */}
          <div className="w-full sm:w-36">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="Sampai Tanggal"
              className={inputBaseClass}
            />
          </div>

          {/* Classification */}
          <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[200px]">
            <ClassificationPicker
              value={classificationId}
              onChange={setClassificationId}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleFilter}
              className="bg-[#2A7FD4] text-white rounded-lg h-9 px-4 text-xs font-semibold hover:bg-[#2571BF] transition-colors"
            >
              Filter
            </button>
            <button
              onClick={handleResetFilter}
              className="border border-[#E2E8F0] rounded-lg h-9 px-4 text-xs text-[#64748B] hover:bg-[#F7F9FC] transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && <ErrorMessage error={error} />}

      {/* Tabel surat */}
      <Table
        columns={columns}
        data={letters}
        loading={loading}
        emptyText="Belum ada surat. Klik 'Ambil Nomor' untuk memulai."
        emptyIcon="📝"
      />

      {/* Pagination */}
      <Pagination meta={meta} onPageChange={handlePageChange} />

      {/* Confirm void dialog */}
      <ConfirmDialog
        isOpen={!!voidTarget}
        onClose={() => {
          setVoidTarget(null);
          setVoidError(null);
        }}
        onConfirm={handleVoidConfirm}
        title="Batalkan Surat"
        message={
          voidTarget
            ? `Apakah Anda yakin ingin membatalkan surat nomor "${
                displayLetterNumber(voidTarget)
              }"? Aksi ini tidak dapat dibatalkan.`
            : ''
        }
        confirmLabel="Ya, Batalkan"
        loading={voidLoading}
      />

      {/* Void error (tampil di bawah tabel jika ada) */}
      {voidError && (
        <ErrorMessage error={voidError} />
      )}
    </div>
  );
}
