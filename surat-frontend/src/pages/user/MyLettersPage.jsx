import { useState, useEffect, useCallback } from 'react';
import { displayLetterNumber } from '../../utils/formatNumber';
import { useLetters } from '../../hooks/useLetters';
import { useToast } from '../../hooks/useToast';
import {
  TagIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  XMarkIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import ClassificationPicker from '../../components/ui/ClassificationPicker';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';
import StatusChip from '../../components/ui/StatusChip';
import ErrorMessage from '../../components/ui/ErrorMessage';

/**
 * MyLettersPage — Halaman riwayat surat milik user.
 *
 * Fitur:
 * - Tabel: Nomor | Klasifikasi | Perihal | Tujuan | Tanggal | Status | Aksi
 * - Filter: date range, classification, reset
 * - Aksi: Edit (hanya jika status=active DAN issued_date dalam 2 hari terakhir)
 * - Pagination
 */
export default function MyLettersPage() {
  const { letters, loading, error, meta, fetchMyLetters, updateLetter, refetch } =
    useLetters();
  const toast = useToast();

  // Filter state
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [classificationId, setClassificationId] = useState(null);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [sifatSurat, setSifatSurat] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Edit modal state
  const [editTarget, setEditTarget] = useState(null);
  const [editClassificationId, setEditClassificationId] = useState(null);
  const [editSubject, setEditSubject] = useState('');
  const [editDestination, setEditDestination] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  // Build params dari filter
  const buildParams = useCallback(
    (page = 1) => {
      const params = { page };
      if (search) params.search = search;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (classificationId) params.classification_id = classificationId;
      if (source) params.source = source;
      if (sifatSurat) params.sifat_surat = sifatSurat;
      return params;
    },
    [search, dateFrom, dateTo, classificationId, source, sifatSurat]
  );

  // Fetch data saat mount dan saat filter/page berubah
  useEffect(() => {
    fetchMyLetters(buildParams(currentPage));
  }, [fetchMyLetters, buildParams, currentPage]);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleFilter = () => {
    setCurrentPage(1);
    fetchMyLetters(buildParams(1));
  };

  const handleResetFilter = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setClassificationId(null);
    setSource('');
    setSifatSurat('');
    setCurrentPage(1);
    fetchMyLetters({ page: 1 });
  };

  // Cek apakah surat dapat diedit:
  // status=active DAN issued_date dalam rentang 2 hari (hari ke-0 + hari ke-1)
  const canEdit = (letter) => {
    if (letter.status !== 'active') return false;

    const issued = new Date(letter.issued_date);
    issued.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today - issued) / 86400000);
    return diffDays <= 1;
  };

  // Buka modal edit dengan data surat yang dipilih
  const openEditModal = (letter) => {
    setEditTarget(letter);
    setEditClassificationId(letter.classification?.id ?? null);
    setEditSubject(letter.subject ?? '');
    setEditDestination(letter.destination ?? '');
    setEditError(null);
  };

  const closeEditModal = () => {
    setEditTarget(null);
    setEditError(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTarget) return;

    setEditLoading(true);
    setEditError(null);

    try {
      await updateLetter(editTarget.id, {
        classification_id: editClassificationId,
        subject: editSubject,
        destination: editDestination,
      });
      closeEditModal();
      toast.success('Detail surat berhasil diperbarui.');
      refetch();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
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
              {new Date(row.issued_date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            {row.sifat_surat && (
              <>
                <span className="text-slate-200 text-[10px]">•</span>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter">
                  {{
                    sangat_segera: 'Sgt Segera',
                    segera: 'Segera',
                    penting: 'Penting',
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
      render: (value, row) => <StatusChip status={value} source={row.source} />,
    },
    {
      key: 'actions',
      label: '',
      render: (_value, row) => {
        if (!canEdit(row)) return null;
        return (
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all duration-200 border border-blue-100"
            onClick={() => openEditModal(row)}
          >
            <PencilSquareIcon className="h-3.5 w-3.5" />
            Edit
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* KIRI: Klasifikasi */}
          <div className="lg:col-span-6 space-y-2.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
              <TagIcon className="h-3.5 w-3.5" />
              Filter Klasifikasi
            </label>
            <div className="bg-slate-50/50 rounded-2xl p-1.5 border border-slate-100 h-full min-h-[250px]">
              <ClassificationPicker
                value={classificationId}
                onChange={setClassificationId}
              />
            </div>
          </div>

          {/* KANAN: Semua filter lainnya */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* Atas: Search */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <MagnifyingGlassIcon className="h-3.5 w-3.5" />
                Cari Surat
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari perihal, tujuan, atau nomor..."
                className={inputBaseClass}
              />
            </div>

            {/* Tengah: Grid Filter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
              {/* Tanggal */}
              <div className="md:col-span-2 space-y-2.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <CalendarDaysIcon className="h-3.5 w-3.5" />
                  Rentang Tanggal
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className={inputBaseClass}
                  />
                  <span className="text-slate-300 font-medium text-xs">s/d</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className={inputBaseClass}
                  />
                </div>
              </div>

              {/* Status (Ex-Sumber) */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <FunnelIcon className="h-3.5 w-3.5" />
                  Status
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className={inputBaseClass}
                >
                  <option value="">Semua Status</option>
                  <option value="regular">Nomor Aktif (Regular)</option>
                  <option value="gap">Nomor Kosong (Gap)</option>
                </select>
              </div>

              {/* Sifat Surat */}
              <div className="md:col-span-3 space-y-2.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <BriefcaseIcon className="h-3.5 w-3.5" />
                  Sifat Surat
                </label>
                <select
                  value={sifatSurat}
                  onChange={(e) => setSifatSurat(e.target.value)}
                  className={inputBaseClass}
                >
                  <option value="">Semua Sifat</option>
                  <option value="biasa">Biasa</option>
                  <option value="penting">Penting</option>
                  <option value="segera">Segera</option>
                  <option value="sangat_segera">Sangat Segera</option>
                  <option value="rahasia">Rahasia</option>
                </select>
              </div>
            </div>

            {/* Bawah: Action Buttons */}
            <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
              <p className="text-[11px] text-slate-400 italic hidden sm:block px-1">
                * Gunakan filter untuk pencarian spesifik
              </p>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleResetFilter}
                  className="flex-1 sm:flex-none text-xs font-bold text-slate-400 hover:text-slate-600 px-6 py-2 rounded-xl transition-colors border border-slate-100 hover:border-slate-200"
                >
                  Reset
                </button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleFilter}
                  className="flex-[2] sm:flex-none px-10 h-10 shadow-lg shadow-primary/20"
                >
                  Terapkan Filter
                </Button>
              </div>
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
        emptyIcon={DocumentTextIcon}
      />

      {/* Pagination */}
      <Pagination meta={meta} onPageChange={handlePageChange} />

      {/* Edit modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeEditModal}
          />

          {/* Modal card */}
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-navy">Edit Detail Surat</h2>
                  <p className="mt-0.5 text-xs text-slate-400 font-mono">
                    {displayLetterNumber(editTarget)}
                  </p>
                </div>
                <button
                  onClick={closeEditModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* KIRI: Klasifikasi */}
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <TagIcon className="h-3.5 w-3.5" />
                    Klasifikasi Surat
                  </label>
                  <div className="bg-slate-50 rounded-xl p-1 border border-slate-100">
                    <ClassificationPicker
                      value={editClassificationId}
                      onChange={setEditClassificationId}
                    />
                  </div>
                </div>

                {/* KANAN: Perihal, Tujuan, & Aksi */}
                <div className="flex flex-col h-full space-y-6">
                  <div className="space-y-5">
                    {/* Perihal */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                        Perihal
                      </label>
                      <textarea
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        placeholder="Perihal surat..."
                        maxLength={255}
                        required
                        rows={3}
                        className={`${inputBaseClass} !h-auto py-3 resize-none`}
                      />
                    </div>

                    {/* Tujuan */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                        Tujuan
                      </label>
                      <input
                        type="text"
                        value={editDestination}
                        onChange={(e) => setEditDestination(e.target.value)}
                        placeholder="Tujuan surat..."
                        maxLength={255}
                        required
                        className={inputBaseClass}
                      />
                    </div>
                  </div>

                  {/* Error */}
                  {editError && <ErrorMessage error={editError} />}

                  {/* Actions */}
                  <div className="mt-auto pt-6 border-t border-slate-100 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      disabled={editLoading}
                      className="flex-1 text-xs font-bold text-slate-400 hover:text-slate-600 px-4 py-2.5 rounded-xl transition-colors border border-slate-100 hover:border-slate-200 disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={editLoading || !editClassificationId}
                      className="flex-[2] h-10 shadow-lg shadow-primary/20"
                    >
                      {editLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
