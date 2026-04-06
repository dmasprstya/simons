import { useState, useEffect, useCallback } from 'react';
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
      label: 'Nomor',
      render: (value) => (
        <span className="font-medium text-gray-900">
          {value}
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
      key: 'subject',
      label: 'Perihal',
      render: (value) => (
        <span className="max-w-[200px] truncate block" title={value}>
          {value}
        </span>
      ),
    },
    {
      key: 'destination',
      label: 'Tujuan',
      render: (value) => (
        <span className="max-w-[150px] truncate block" title={value}>
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
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setVoidError(null);
              setVoidTarget(row);
            }}
          >
            Batalkan
          </Button>
        );
      },
    },
  ];

  const inputBaseClass = `
    block w-full rounded-lg border border-gray-300 bg-white
    px-3 py-2 text-sm text-gray-900
    shadow-sm transition-colors
    focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none
  `;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📝 Riwayat Surat</h1>
        <p className="mt-1 text-sm text-gray-500">
          Daftar seluruh surat yang pernah Anda ambil.
        </p>
      </div>


      {/* Filter card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Date From */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={inputBaseClass}
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={inputBaseClass}
            />
          </div>

          {/* Classification */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Klasifikasi
            </label>
            <ClassificationPicker
              value={classificationId}
              onChange={setClassificationId}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
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
                voidTarget.number
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
