import { useState, useEffect } from 'react';
import { displayLetterNumber } from '../../utils/formatNumber';
import { useGapRequests } from '../../hooks/useGapRequests';
import { useToast } from '../../hooks/useToast';
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
  const [selectedNumber, setSelectedNumber] = useState(null); // nomor gap yang dipilih dari tabel
  const [gapDate, setGapDate] = useState('');
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
  const [vacantPage, setVacantPage] = useState(null); // null = belum pernah tampil

  // === Expand state untuk tree view nomor kosong ===
  const [expandedMonths, setExpandedMonths] = useState({});
  const [expandedDates, setExpandedDates] = useState({});

  // Grouping vacantNumbers → { monthKey: { label, dates: { dateKey: { label, numbers[] } } } }
  const groupedVacant = (() => {
    if (!vacantNumbers || vacantNumbers.length === 0) return {};
    const groups = {};
    vacantNumbers.forEach((item) => {
      const d = new Date(item.date + 'T00:00:00');
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      const dateKey = item.date;
      const dateLabel = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      if (!groups[monthKey]) groups[monthKey] = { label: monthLabel, dates: {} };
      if (!groups[monthKey].dates[dateKey]) groups[monthKey].dates[dateKey] = { label: dateLabel, numbers: [] };
      groups[monthKey].dates[dateKey].numbers.push(item);
    });
    return groups;
  })();

  const toggleMonth = (key) => setExpandedMonths((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleDate = (key) => setExpandedDates((prev) => ({ ...prev, [key]: !prev[key] }));

  // Batas karakter alasan
  const REASON_MAX = 1000;
  const REASON_MIN = 10;

  // Fetch data riwayat saat mount dan saat page berubah
  useEffect(() => {
    fetchMyRequests({ page: currentPage });
  }, [fetchMyRequests, currentPage]);

  // Fetch nomor kosong saat vacantPage berubah (hanya jika sudah pernah klik Tampilkan)
  useEffect(() => {
    if (vacantPage === null) return;
    fetchVacantNumbers({ date_from: vacantDateFrom, date_to: vacantDateTo, page: vacantPage });
  }, [vacantPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // === Pilih nomor dari tabel ===
  const handleSelectNumber = (row) => {
    setSelectedNumber(row.number);
    setGapDate(row.date);
    setValidationErrors((prev) => ({ ...prev, number: undefined, gapDate: undefined }));
  };

  // === Validasi form ===
  const validate = () => {
    const errors = {};

    if (!classificationId) {
      errors.classification = 'Klasifikasi wajib dipilih.';
    }
    if (!selectedNumber) {
      errors.number = 'Pilih nomor gap dari tabel Nomor Kosong Tersedia.';
    }
    if (!gapDate) {
      errors.gapDate = 'Tanggal gap wajib diisi.';
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
    setSelectedNumber(null);
    setGapDate('');
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
        number: selectedNumber,
        gap_date: gapDate,
        reason: reason.trim(),
      });

      // Sukses — tampilkan toast, reset form, refresh tabel
      toast.success('Request berhasil dikirim, menunggu persetujuan admin.');
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
      key: 'issued_number',
      label: 'Nomor Diterbitkan',
      render: (value, row) => {
        // Tampilkan nomor hanya jika status approved
        if (row.status === 'approved') {
          // Gunakan formatted_number dari letter jika tersedia
          const displayNumber = row.letter
            ? displayLetterNumber(row.letter)
            : (value || '-');
          return (
            <span className="font-semibold text-[#2A7FD4] font-mono">
              {displayNumber}
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

      {/* ==================== BAGIAN ATAS — Form Request Baru ==================== */}
      <Card className="max-w-2xl mx-auto">
        <div className="mb-5">
          <h2 className="text-base font-bold text-navy">Buat Request Baru</h2>
          <p className="text-xs text-muted mt-0.5">Isi form di bawah untuk mengajukan gap request.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ClassificationPicker — wajib, is_leaf=true */}
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
              <p className="mt-1 text-xs text-red-600">
                {validationErrors.classification}
              </p>
            )}
          </div>

          {/* Nomor gap terpilih — diisi otomatis dari tabel nomor kosong */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">
              Nomor Gap <span className="text-red-500">*</span>
            </label>
            <div
              className={`flex items-center h-9 rounded-lg border bg-[#F7F9FC] px-3 text-sm ${
                validationErrors.number
                  ? 'border-red-300'
                  : selectedNumber
                  ? 'border-[#2A7FD4]'
                  : 'border-[#E2E8F0]'
              }`}
            >
              {selectedNumber ? (
                <>
                  <span className="font-mono font-semibold text-[#2A7FD4] mr-2">{selectedNumber}</span>
                  {gapDate && (
                    <span className="text-xs text-[#64748B]">
                      — {new Date(gapDate + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => { setSelectedNumber(null); setGapDate(''); }}
                    className="ml-auto text-[#94A3B8] hover:text-red-500 text-xs"
                    disabled={submitting}
                  >
                    ✕ Batal
                  </button>
                </>
              ) : (
                <span className="text-[#94A3B8] italic">Pilih nomor dari tabel Nomor Kosong di bawah</span>
              )}
            </div>
            {validationErrors.number && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.number}</p>
            )}
          </div>

          {/* Textarea — Alasan (wajib, min 10 karakter, counter karakter) */}
          <div>
            <label
              htmlFor="reason"
              className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1"
            >
              Alasan <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              rows={3}
              maxLength={REASON_MAX}
              placeholder="Jelaskan alasan Anda membutuhkan nomor dari zona gap (minimal 10 karakter)"
              className={`block w-full min-h-[80px] resize-none rounded-lg border bg-[#F7F9FC] px-3 py-2 text-sm text-[#0B1F3A]
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

          {/* Submit error */}
          {submitError && <ErrorMessage error={submitError} />}

          {/* Tombol submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={submitting}
          >
            Kirim Request
          </Button>
        </form>
      </Card>

      {/* ==================== BAGIAN TENGAH — Nomor Kosong Tersedia ==================== */}
      <Card className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-navy">Nomor Kosong Tersedia</h2>
          <p className="text-xs text-muted mt-0.5">Filter berdasarkan rentang tanggal gap.</p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="vacant_date_from" className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A]">
              Dari Tanggal
            </label>
            <input
              id="vacant_date_from"
              type="date"
              value={vacantDateFrom}
              onChange={(e) => setVacantDateFrom(e.target.value)}
              className={`${inputBaseClass} border-[#E2E8F0] w-auto`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="vacant_date_to" className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A]">
              Sampai Tanggal
            </label>
            <input
              id="vacant_date_to"
              type="date"
              value={vacantDateTo}
              onChange={(e) => setVacantDateTo(e.target.value)}
              className={`${inputBaseClass} border-[#E2E8F0] w-auto`}
            />
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              // Reset ke page 1; jika vacantPage sudah 1, paksa re-fetch via fetchVacantNumbers langsung
              if (vacantPage === 1) {
                fetchVacantNumbers({ date_from: vacantDateFrom, date_to: vacantDateTo, page: 1 });
              } else {
                setVacantPage(1);
              }
            }}
          >
            Tampilkan
          </Button>
        </div>

        {/* Error state */}
        {vacantError && <ErrorMessage error={vacantError} />}

        {/* Tree view nomor kosong — Month → Date → Numbers */}
        {vacantLoading && (
          <div className="py-6 text-center text-sm text-[#94A3B8] animate-pulse">Memuat nomor kosong...</div>
        )}

        {!vacantLoading && vacantPage !== null && Object.keys(groupedVacant).length === 0 && (
          <div className="py-8 text-center">
            <div className="text-2xl mb-1">✅</div>
            <p className="text-sm text-[#94A3B8]">Tidak ada nomor kosong tersedia.</p>
          </div>
        )}

        {!vacantLoading && Object.keys(groupedVacant).length > 0 && (
          <div className="space-y-2">
            {Object.entries(groupedVacant).map(([monthKey, monthData]) => (
              <div key={monthKey} className="border border-[#E2E8F0] rounded-lg overflow-hidden">
                {/* Month header */}
                <button
                  type="button"
                  onClick={() => toggleMonth(monthKey)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-[#F0F6FF] hover:bg-[#E4EFFE] transition-colors text-left"
                >
                  <span className="text-sm font-semibold text-[#0B1F3A] flex items-center gap-2">
                    <span className="text-base">📅</span>
                    {monthData.label}
                    <span className="text-xs font-normal text-[#64748B]">
                      ({Object.values(monthData.dates).reduce((acc, d) => acc + d.numbers.length, 0)} nomor)
                    </span>
                  </span>
                  <span className={`text-[#2A7FD4] text-xs transition-transform duration-200 ${expandedMonths[monthKey] ? 'rotate-90' : ''}`}>
                    ▶
                  </span>
                </button>

                {/* Date list */}
                {expandedMonths[monthKey] && (
                  <div className="divide-y divide-[#F1F5F9]">
                    {Object.entries(monthData.dates).map(([dateKey, dateData]) => (
                      <div key={dateKey}>
                        {/* Date header */}
                        <button
                          type="button"
                          onClick={() => toggleDate(dateKey)}
                          className="w-full flex items-center justify-between px-5 py-2 bg-white hover:bg-[#F7F9FC] transition-colors text-left"
                        >
                          <span className="text-xs font-medium text-[#334155] flex items-center gap-2">
                            <span>🗓</span>
                            {dateData.label}
                            <span className="text-[#94A3B8] font-normal">
                              ({dateData.numbers.length} nomor)
                            </span>
                          </span>
                          <span className={`text-[#94A3B8] text-[10px] transition-transform duration-200 ${expandedDates[dateKey] ? 'rotate-90' : ''}`}>
                            ▶
                          </span>
                        </button>

                        {/* Numbers grid */}
                        {expandedDates[dateKey] && (
                          <div className="px-5 py-3 bg-[#FAFBFE] flex flex-wrap gap-2">
                            {dateData.numbers.map((item) => (
                              <button
                                key={item.number}
                                type="button"
                                onClick={() => handleSelectNumber(item)}
                                title={`Zona gap: ${item.gap_start} – ${item.gap_end}`}
                                className={`px-3 py-1 rounded-md text-xs font-mono font-semibold border transition-all duration-150 ${
                                  selectedNumber === item.number
                                    ? 'bg-[#2A7FD4] text-white border-[#2A7FD4] shadow-sm'
                                    : 'bg-white text-[#2A7FD4] border-[#BFDBFE] hover:bg-[#2A7FD4] hover:text-white hover:border-[#2A7FD4]'
                                }`}
                              >
                                {selectedNumber === item.number ? `✓ ${item.number}` : item.number}
                              </button>
                            ))}
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

        {/* Pagination */}
        <Pagination meta={vacantMeta} onPageChange={(page) => setVacantPage(page)} />
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
          emptyIcon="📋"
        />

        {/* Pagination */}
        <Pagination meta={meta} onPageChange={handlePageChange} />
      </Card>
    </div>
  );
}
