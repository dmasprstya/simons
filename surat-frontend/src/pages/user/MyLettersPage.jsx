import { useState, useEffect, useCallback } from 'react';
import { displayLetterNumber, displayClassification } from '../../utils/formatNumber';
import { useLetters } from '../../hooks/useLetters';
import { useToast } from '../../hooks/useToast';
import ClassificationPicker from '../../components/ui/ClassificationPicker';
import Card from '../../components/ui/Card';
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
        <div className="flex flex-col py-1">
          <span className="font-bold text-primary font-mono tracking-tight text-[13px]">
            {displayLetterNumber(row)}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-slate-400 font-medium">
              {row.issued_date}
            </span>
            {row.sifat_surat && (
              <>
                <span className="text-slate-200 text-[10px]">•</span>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter">
                  {{
                    sangat_segera: 'Sgt Segera',
                    segera: 'Segera',
                    biasa: 'Biasa',
                    rahasia: 'Rahasia',
                  }[row.sifat_surat] || row.sifat_surat}
                </span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'classification',
      label: 'Klasifikasi',
      render: (value) => (
        <div className="flex flex-col">
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase w-fit mb-1 tracking-wider">
            {value?.code || '-'}
          </span>
          <span className="text-[11px] font-medium text-navy max-w-[140px] leading-tight line-clamp-2">
            {value?.name || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'subject',
      label: 'Perihal & Tujuan',
      render: (_value, row) => (
        <div className="flex flex-col py-1 min-w-[200px] max-w-[300px]">
          <span className="font-semibold text-navy text-sm leading-snug line-clamp-2" title={row.subject}>
            {row.subject}
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="shrink-0 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ke:</span>
            <span className="text-[11px] text-slate-500 truncate" title={row.destination}>
              {row.destination}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusChip status={value} />,
    },
    {
      key: 'actions',
      label: '',
      render: (_value, row) => {
        if (!canVoid(row)) return null;
        return (
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-all duration-200 border border-red-100"
            onClick={() => {
              setVoidError(null);
              setVoidTarget(row);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Batalkan
          </button>
        );
      },
    },
  ];

  const inputBaseClass = `
    block w-full h-10 rounded-xl border border-[#E2E8F0] bg-[#F7F9FC]
    px-4 text-sm text-primary
    transition-all duration-200
    focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10
    placeholder:text-slate-400
  `;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-navy">Riwayat Surat</h1>
        <p className="mt-1 text-sm text-muted">Daftar seluruh surat yang pernah Anda ambil.</p>
      </div>

      {/* Filter bar */}
      <Card padding="md" className="border-slate-200 overflow-visible">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* KIRI: Klasifikasi */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Filter Klasifikasi
            </label>
            <ClassificationPicker
              value={classificationId}
              onChange={setClassificationId}
            />
          </div>

          {/* KANAN: Tanggal & Aksi */}
          <div className="flex flex-col h-full">
            {/* Atas: Rentang Tanggal */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Rentang Tanggal
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className={inputBaseClass}
                  />
                </div>
                <span className="text-slate-300 font-medium text-xs">s/d</span>
                <div className="flex-1">
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className={inputBaseClass}
                  />
                </div>
              </div>
            </div>

            {/* Bawah: Tombol Aksi (Sticky to bottom of the grid row) */}
            <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetFilter}
                  className="flex-1 text-xs font-bold text-slate-400 hover:text-slate-600 px-4 py-2 rounded-xl transition-colors text-center border border-slate-100 hover:border-slate-200"
                >
                  Reset
                </button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleFilter}
                  className="flex-[2] px-8 h-10 shadow-lg shadow-primary/20 bg-primary"
                >
                  Terapkan Filter
                </Button>
              </div>
              <p className="text-[11px] text-slate-400 italic text-right px-1">
                * Gunakan filter untuk mencari surat secara spesifik
              </p>
            </div>
          </div>
        </div>
      </Card>

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
            ? `Apakah Anda yakin ingin membatalkan surat nomor "${displayLetterNumber(voidTarget)
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
