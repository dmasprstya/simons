import { useState, useEffect } from 'react';
import { displayClassification } from '../../utils/formatNumber';
import { useGapRequests } from '../../hooks/useGapRequests';
import { useToast } from '../../hooks/useToast';
import {
  CheckCircleIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  XMarkIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import ClassificationPicker from '../../components/ui/ClassificationPicker';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';
import StatusChip from '../../components/ui/StatusChip';
import ErrorMessage from '../../components/ui/ErrorMessage';

/**
 * GapRequestPage — Halaman untuk membuat dan melihat riwayat gap request.
 *
 * Dua bagian:
 * 1. ATAS  — Form request gap baru (ClassificationPicker, gap_date, reason)
 * 2. BAWAH — Tabel riwayat request (Tanggal Request | Klasifikasi | Tanggal Gap | Alasan | Status | Nomor Diterbitkan)
 *
 * Submit flow:
 *   - Validasi semua field
 *   - POST /gap-requests → { classification_id, gap_date, reason }
 *   - Sukses: notifikasi + reset form + refresh tabel
 */
export default function GapRequestPage() {
  const {
    requests, loading, error, meta, fetchMyRequests, createRequest, refetch,
    vacantNumbers, vacantMeta, vacantLoading, vacantError, fetchVacantNumbers,
  } = useGapRequests();
  const toast = useToast();

  // === Form state ===
  const [classificationId, setClassificationId] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]); // Array of { number, date }
  const [subject, setSubject] = useState('');
  const [destination, setDestination] = useState('');
  const [sifatSurat, setSifatSurat] = useState('');
  const [reason, setReason] = useState('');

  // === UI state ===
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // === Pagination state ===
  const [currentPage, setCurrentPage] = useState(1);

  // === Nomor Kosong filter state ===
  const [vacantDateFrom, setVacantDateFrom] = useState('');
  const [vacantDateTo, setVacantDateTo] = useState('');
  const [vacantPage, setVacantPage] = useState(1);

  // === Expand state untuk tree view nomor kosong ===
  const [expandedMonths, setExpandedMonths] = useState({});
  const [expandedDates, setExpandedDates] = useState({});

  // === Applied filter state untuk nomor kosong ===
  const [appliedVacantFilters, setAppliedVacantFilters] = useState({
    dateFrom: '',
    dateTo: '',
  });

  // Opsi dropdown Sifat Surat — nilai enum sesuai backend
  const SIFAT_SURAT_OPTIONS = [
    { value: 'sangat_segera', label: 'Sangat Segera' },
    { value: 'segera', label: 'Segera' },
    { value: 'penting', label: 'Penting' },
    { value: 'biasa', label: 'Biasa' },
    { value: 'rahasia', label: 'Rahasia' },
  ];

  // Grouping vacantNumbers → { monthKey: { label, dates: { dateKey: { label, numbers[] } } } }
  const groupedVacant = (() => {
    if (!vacantNumbers || vacantNumbers.length === 0) return {};
    const groups = {};
    vacantNumbers.forEach((item) => {
      const d = new Date(item.date + 'T00:00:00');
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      const dateKey = item.date;
      const dateLabel = d.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
      if (!groups[monthKey]) groups[monthKey] = { label: monthLabel, dates: {} };
      if (!groups[monthKey].dates[dateKey]) groups[monthKey].dates[dateKey] = { label: dateLabel, numbers: [] };
      groups[monthKey].dates[dateKey].numbers.push(item);
    });
    return groups;
  })();

  // Nomor terkecil yang tersedia secara global
  const minAvailableNumber = vacantNumbers?.length > 0
    ? Math.min(...vacantNumbers.map((n) => n.number))
    : null;

  const toggleMonth = (key) => setExpandedMonths((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleDate = (key) => setExpandedDates((prev) => ({ ...prev, [key]: !prev[key] }));

  // Batas karakter alasan
  const REASON_MAX = 1000;
  const REASON_MIN = 10;

  // Fetch data riwayat saat mount dan saat page berubah
  useEffect(() => {
    fetchMyRequests({ page: currentPage });
  }, [fetchMyRequests, currentPage]);

  // Fetch nomor kosong saat mount, saat filter tanggal berubah, atau saat page berubah
  useEffect(() => {
    fetchVacantNumbers({ 
      date_from: appliedVacantFilters.dateFrom, 
      date_to: appliedVacantFilters.dateTo, 
      page: vacantPage 
    });
  }, [appliedVacantFilters, vacantPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterVacant = () => {
    setVacantPage(1);
    setAppliedVacantFilters({
      dateFrom: vacantDateFrom,
      dateTo: vacantDateTo,
    });
  };

  // === Pilih nomor dari tabel ===
  const handleSelectNumber = (row) => {
    const isAlreadySelected = selectedItems.some(item => item.number === row.number);
    
    if (isAlreadySelected) {
      // Hanya izinkan deselect nomor terakhir (paling besar) dalam pilihan
      const maxSelected = Math.max(...selectedItems.map(i => i.number));
      if (row.number === maxSelected) {
        setSelectedItems(prev => prev.filter(item => item.number !== row.number));
      } else {
        toast.info('Hanya nomor terakhir yang dapat dibatalkan untuk menjaga urutan.');
      }
    } else {
      // Pastikan memilih nomor berikutnya sesuai urutan di vacantNumbers
      const nextIndex = selectedItems.length;
      const nextExpected = vacantNumbers[nextIndex];
      
      if (nextExpected && row.number === nextExpected.number) {
        setSelectedItems(prev => [...prev, { number: row.number, gap_date: row.date }]);
        setValidationErrors(prev => ({ ...prev, numbers: undefined }));
      }
    }
  };

  // === Validasi form ===
  const validate = () => {
    const errors = {};

    if (!classificationId) {
      errors.classification = 'Klasifikasi wajib dipilih.';
    }
    if (selectedItems.length === 0) {
      errors.numbers = 'Pilih minimal satu nomor gap dari daftar.';
    }
    if (!subject.trim()) {
      errors.subject = 'Perihal wajib diisi.';
    } else if (subject.trim().length > 255) {
      errors.subject = 'Perihal maksimal 255 karakter.';
    }
    if (!destination.trim()) {
      errors.destination = 'Tujuan wajib diisi.';
    } else if (destination.trim().length > 255) {
      errors.destination = 'Tujuan maksimal 255 karakter.';
    }
    if (!sifatSurat) {
      errors.sifat_surat = 'Sifat surat wajib dipilih.';
    }
    if (!reason.trim()) {
      errors.reason = 'Alasan wajib diisi.';
    } else if (reason.trim().length < REASON_MIN) {
      errors.reason = `Alasan minimal ${REASON_MIN} karakter.`;
    } else if (reason.trim().length > REASON_MAX) {
      errors.reason = `Alasan maksimal ${REASON_MAX} karakter.`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // === Reset form ===
  const resetForm = () => {
    setClassificationId(null);
    setSelectedItems([]);
    setSubject('');
    setDestination('');
    setSifatSurat('');
    setReason('');
    setSubmitError(null);
    setValidationErrors({});
  };

  // === Handle submit ===
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await createRequest({
        classification_id: classificationId,
        items: selectedItems,
        subject: subject.trim(),
        destination: destination.trim(),
        sifat_surat: sifatSurat,
        reason: reason.trim(),
      });

      // Sukses — tampilkan toast, reset form, refresh tabel
      toast.success(`${selectedItems.length} gap request berhasil diajukan.`);
      resetForm();
      setCurrentPage(1);
      refetch();
    } catch (err) {
      setSubmitError(err.message);
      toast.error('Gagal mengirim request.');
    } finally {
      setSubmitting(false);
    }
  };

  // === Handle ganti halaman ===
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // === Kolom tabel riwayat ===
  const columns = [
    {
      key: 'created_at',
      label: 'Tanggal Request',
      render: (value) => {
        if (!value) return '-';
        // Format tanggal ke format lokal Indonesia
        const date = new Date(value);
        return date.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      },
    },
    {
      key: 'classification',
      label: 'Klasifikasi',
      render: (value) => (
        <span className="bg-[#EBF4FD] text-[#185FA5] px-2 py-0.5 rounded text-xs font-medium">
          {displayClassification(value)}
        </span>
      ),
    },
    {
      key: 'subject',
      label: 'Perihal & Tujuan',
      render: (_value, row) => (
        <div className="flex flex-col py-1 min-w-[180px] max-w-[250px]">
          <span className="font-semibold text-navy text-xs leading-snug line-clamp-2" title={row.subject}>
            {row.subject || '-'}
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="shrink-0 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ke:</span>
            <span className="text-[10px] text-slate-500 truncate" title={row.destination}>
              {row.destination || '-'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'gap_date',
      label: 'Tanggal Gap',
      render: (value) => {
        if (!value) return '-';
        const date = new Date(value + 'T00:00:00');
        return date.toLocaleDateString('id-ID', {
          weekday: 'long',
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
        <span className="max-w-[200px] truncate block text-xs text-[#64748B]" title={value}>
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'sifat_surat',
      label: 'Sifat',
      render: (value) => (
        <span className="text-xs font-medium text-[#475569]">
          {{
            sangat_segera: 'Sangat Segera',
            segera: 'Segera',
            penting: 'Penting',
            biasa: 'Biasa',
            rahasia: 'Rahasia',
          }[value] ?? value}
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
        // Tampilkan nomor hanya jika status approved
        if (row.status === 'approved' && value) {
          return (
            <span className="font-semibold text-[#2A7FD4] font-mono">
              {value}
            </span>
          );
        }
        return <span className="text-[#94A3B8]">-</span>;
      },
    },
    {
      key: 'formatted_number',
      label: 'Nomor Surat',
      render: (value, row) => {
        if (row.status === 'approved' && value) {
          return (
            <span className="font-bold text-[#0B1F3A] font-mono whitespace-nowrap">
              {value}
            </span>
          );
        }
        return <span className="text-[#94A3B8]">-</span>;
      },
    },
  ];

  // === Styling helper ===
  const inputBaseClass = `
    block w-full h-9 rounded-lg border bg-[#F7F9FC] px-3 text-sm text-[#0B1F3A]
    transition-all duration-200
    focus:border-[#2A7FD4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2A7FD4]/20
    disabled:bg-[#F7F9FC] disabled:text-[#94A3B8] disabled:cursor-not-allowed
  `;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-navy">Gap Request</h1>
        <p className="mt-1 text-sm text-muted">
          Ajukan permintaan nomor surat dari zona gap dan lihat riwayat request Anda.
        </p>
      </div>

      {/* ==================== UNIFIED — Form + Nomor Kosong ==================== */}
      <Card>
        <div className="mb-6">
          <h2 className="text-base font-bold text-navy">Buat Request Baru</h2>
          <p className="text-xs text-muted mt-0.5">Lengkapi data di bawah untuk mengajukan gap request.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. ClassificationPicker */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-2">
              Klasifikasi Surat <span className="text-red-500">*</span>
            </label>
            <ClassificationPicker
              value={classificationId}
              onChange={setClassificationId}
              disabled={submitting}
            />
            {validationErrors.classification && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.classification}</p>
            )}
          </div>

          {/* 2. Integrated Number Picker */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-navy">Pilih Nomor Kosong</h3>
                <p className="text-[10px] text-muted mt-0.5">Gunakan filter untuk mencari nomor berdasarkan tanggal gap.</p>
              </div>

              {/* Mini Filter bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-[#64748B] uppercase shrink-0 w-12 sm:w-auto">Dari:</span>
                  <input
                    type="date"
                    value={vacantDateFrom}
                    onChange={(e) => setVacantDateFrom(e.target.value)}
                    className="flex-1 h-7 rounded border border-[#E2E8F0] bg-white px-2 text-[10px] text-[#0B1F3A] focus:outline-none focus:ring-1 focus:ring-[#2A7FD4]/20"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-[#64748B] uppercase shrink-0 w-12 sm:w-auto">Sampai:</span>
                  <input
                    type="date"
                    value={vacantDateTo}
                    onChange={(e) => setVacantDateTo(e.target.value)}
                    className="flex-1 h-7 rounded border border-[#E2E8F0] bg-white px-2 text-[10px] text-[#0B1F3A] focus:outline-none focus:ring-1 focus:ring-[#2A7FD4]/20"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleFilterVacant}
                  className="h-7 px-3 bg-[#2A7FD4] text-white text-[10px] font-bold rounded hover:bg-[#185FA5] transition-colors"
                >
                  Cari
                </button>
              </div>
            </div>

            {/* Error state picker */}
            {vacantError && <ErrorMessage error={vacantError} />}

            {/* Tree view — scrollable within form */}
            <div className="overflow-y-auto max-h-[280px] pr-1 space-y-2 custom-scrollbar">
              {vacantLoading && (
                <div className="py-6 text-center text-sm text-[#94A3B8] animate-pulse">Memuat nomor kosong...</div>
              )}

              {!vacantLoading && Object.keys(groupedVacant).length === 0 && (
                <div className="py-8 text-center bg-white border border-dashed border-[#E2E8F0] rounded-lg">
                  <CheckCircleIcon className="h-8 w-8 mx-auto mb-1 text-emerald-500" />
                  <p className="text-xs text-[#94A3B8]">Tidak ada nomor kosong tersedia.</p>
                </div>
              )}

              {!vacantLoading && Object.keys(groupedVacant).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(groupedVacant).map(([monthKey, monthData]) => (
                    <div key={monthKey} className="border border-[#E2E8F0] bg-white rounded-lg overflow-hidden">
                      {/* Month header */}
                      <button
                        type="button"
                        onClick={() => toggleMonth(monthKey)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors text-left"
                      >
                        <span className="text-xs font-semibold text-[#0B1F3A] flex items-center gap-2">
                          <CalendarDaysIcon className="h-4 w-4 text-[#2A7FD4]" />
                          {monthData.label}
                          <span className="text-[10px] font-normal text-[#64748B]">
                            ({Object.values(monthData.dates).reduce((acc, d) => acc + d.numbers.length, 0)} nomor)
                          </span>
                        </span>
                        <ChevronRightIcon className={`h-3 w-3 text-[#2A7FD4] transition-transform duration-200 ${expandedMonths[monthKey] ? 'rotate-90' : ''}`} />
                      </button>

                      {/* Date list */}
                      {expandedMonths[monthKey] && (
                        <div className="divide-y divide-[#F1F5F9]">
                          {Object.entries(monthData.dates).map(([dateKey, dateData]) => (
                            <div key={dateKey}>
                              <button
                                type="button"
                                onClick={() => toggleDate(dateKey)}
                                className="w-full flex items-center justify-between px-4 py-1.5 bg-white hover:bg-[#F8FAFC] transition-colors text-left"
                              >
                                <span className="text-[10px] font-medium text-[#334155] flex items-center gap-2">
                                  <CalendarDaysIcon className="h-3.5 w-3.5 text-slate-400" />
                                  {dateData.label}
                                  <span className="text-[#94A3B8] font-normal">({dateData.numbers.length})</span>
                                </span>
                                <ChevronRightIcon className={`h-2.5 w-2.5 text-[#94A3B8] transition-transform duration-200 ${expandedDates[dateKey] ? 'rotate-90' : ''}`} />
                              </button>

                              {expandedDates[dateKey] && (
                                <div className="px-4 pb-2 pt-1 flex flex-wrap gap-1.5">
                                    {dateData.numbers.map((item) => {
                                      const isSelected = selectedItems.some(i => i.number === item.number);
                                      const nextIndex = selectedItems.length;
                                      const isNext = vacantNumbers[nextIndex]?.number === item.number;
                                      const isSelectable = isSelected || isNext;

                                      return (
                                        <button
                                          key={item.number}
                                          type="button"
                                          onClick={() => handleSelectNumber(item)}
                                          disabled={!isSelectable}
                                          title={!isSelectable ? 'Anda harus mengambil nomor sesuai urutan' : ''}
                                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-all duration-150 ${
                                            isSelected
                                              ? 'bg-[#2A7FD4] text-white border-[#2A7FD4] shadow-sm'
                                              : isNext
                                                ? 'bg-white text-[#2A7FD4] border-[#2A7FD4] hover:bg-[#2A7FD4]/5'
                                                : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                                          }`}
                                        >
                                          {isSelected ? `✓ ${item.number}` : item.number}
                                        </button>
                                      );
                                    })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. Nomor gap terpilih — Display Multiple Chips */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">
              Nomor Gap Terpilih ({selectedItems.length}) <span className="text-red-500">*</span>
            </label>
            <div
              className={`min-h-[40px] p-2 rounded-lg border bg-[#F7F9FC] flex flex-wrap gap-2 ${
                validationErrors.numbers
                  ? 'border-red-300'
                  : selectedItems.length > 0
                    ? 'border-[#2A7FD4]'
                    : 'border-[#E2E8F0]'
              }`}
            >
              {selectedItems.length > 0 ? (
                selectedItems.map((item) => (
                  <div key={item.number} className="bg-white border border-[#2A7FD4] rounded px-2 py-1 flex items-center gap-2 shadow-sm animate-in fade-in zoom-in duration-200">
                    <span className="font-mono font-bold text-[#2A7FD4] text-sm">{item.number}</span>
                    <button
                      type="button"
                      onClick={() => handleSelectNumber(item)}
                      className="text-[#94A3B8] hover:text-red-500 transition-colors p-0.5"
                      title="Batalkan nomor ini"
                      disabled={submitting}
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-[#94A3B8] italic text-xs p-1">Silakan pilih nomor dari daftar di atas</span>
              )}
            </div>
            {validationErrors.numbers && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.numbers}</p>
            )}
          </div>

          {/* 4. Perihal & Tujuan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Subject / Perihal */}
            <div>
              <label
                htmlFor="subject"
                className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1"
              >
                Perihal <span className="text-red-500">*</span>
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={submitting}
                maxLength={255}
                placeholder="Contoh: Undangan Rapat Koordinasi"
                className={`${inputBaseClass} ${validationErrors.subject
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-[#E2E8F0]'
                  }`}
              />
              <div className="flex items-center justify-between mt-1">
                {validationErrors.subject ? (
                  <p className="text-xs text-red-600">{validationErrors.subject}</p>
                ) : (
                  <span />
                )}
                <span className="text-[10px] text-[#94A3B8]">
                  {subject.length}/255
                </span>
              </div>
            </div>

            {/* Destination / Tujuan */}
            <div>
              <label
                htmlFor="destination"
                className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1"
              >
                Tujuan <span className="text-red-500">*</span>
              </label>
              <input
                id="destination"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                disabled={submitting}
                maxLength={255}
                placeholder="Contoh: Kepala Dinas Pendidikan"
                className={`${inputBaseClass} ${validationErrors.destination
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-[#E2E8F0]'
                  }`}
              />
              <div className="flex items-center justify-between mt-1">
                {validationErrors.destination ? (
                  <p className="text-xs text-red-600">{validationErrors.destination}</p>
                ) : (
                  <span />
                )}
                <span className="text-[10px] text-[#94A3B8]">
                  {destination.length}/255
                </span>
              </div>
            </div>
          </div>
          
          {/* 5. Sifat Surat */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-2">
              Sifat Surat <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {SIFAT_SURAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSifatSurat(opt.value)}
                  disabled={submitting}
                  className={`
                    px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border
                    ${sifatSurat === opt.value
                      ? 'bg-[#2A7FD4] border-[#2A7FD4] text-white shadow-lg shadow-[#2A7FD4]/20'
                      : 'bg-white border-[#E2E8F0] text-slate-500 hover:border-[#2A7FD4] hover:text-[#2A7FD4]'
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {validationErrors.sifat_surat && (
              <p className="mt-1.5 text-xs text-red-600">{validationErrors.sifat_surat}</p>
            )}
          </div>

          {/* 6. Alasan */}
          <div>
            <label
              htmlFor="reason"
              className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1"
            >
              Alasan Permintaan <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              maxLength={REASON_MAX}
              placeholder="Jelaskan alasan Anda membutuhkan nomor dari zona gap (minimal 10 karakter)"
              className={`block w-full min-h-[100px] resize-none rounded-lg border bg-[#F7F9FC] px-3 py-2 text-sm text-[#0B1F3A]
                transition-all duration-200
                focus:border-[#2A7FD4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2A7FD4]/20
                disabled:bg-[#F7F9FC] disabled:text-[#94A3B8] disabled:cursor-not-allowed ${
                  validationErrors.reason
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-[#E2E8F0]'
                }`}
            />
            <div className="flex items-center justify-between mt-1">
              {validationErrors.reason ? (
                <p className="text-xs text-red-600">{validationErrors.reason}</p>
              ) : (
                <span />
              )}
              <span
                className={`text-[10px] ${
                  reason.length >= REASON_MAX
                    ? 'text-red-500 font-medium'
                    : reason.length >= REASON_MAX * 0.9
                      ? 'text-amber-500'
                      : 'text-[#94A3B8]'
                }`}
              >
                {reason.length}/{REASON_MAX}
              </span>
            </div>
          </div>

          {/* 5. Submit */}
          <div className="pt-2">
            {submitError && <div className="mb-4"><ErrorMessage error={submitError} /></div>}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-lg shadow-[#2A7FD4]/10"
              loading={submitting}
            >
              Kirim Gap Request
            </Button>
          </div>
        </form>
      </Card>

      {/* ==================== BAGIAN BAWAH — Tabel Riwayat Request ==================== */}
      <Card className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-navy">Riwayat Request</h2>
          <p className="text-xs text-muted mt-0.5">Semua gap request yang pernah Anda ajukan.</p>
        </div>

        {/* Error state tabel */}
        {error && <ErrorMessage error={error} />}

        {/* Tabel riwayat */}
        <Table
          columns={columns}
          data={requests}
          loading={loading}
          emptyText="Belum ada gap request. Buat request baru di form atas."
          emptyIcon={ClipboardDocumentListIcon}
        />

        {/* Pagination */}
        <Pagination meta={meta} onPageChange={handlePageChange} />
      </Card>
    </div>
  );
}
