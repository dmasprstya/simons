import { useState, useEffect } from 'react';
import { displayLetterNumber } from '../../utils/formatNumber';
import { useGapRequests } from '../../hooks/useGapRequests';
import { useToast } from '../../hooks/useToast';
import ClassificationPicker from '../../components/ui/ClassificationPicker';
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
  const { requests, loading, error, meta, fetchMyRequests, createRequest, refetch } =
    useGapRequests();
  const toast = useToast();

  // === Form state ===
  const [classificationId, setClassificationId] = useState(null);
  const [gapDate, setGapDate] = useState('');
  const [reason, setReason] = useState('');

  // === UI state ===
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // === Pagination state ===
  const [currentPage, setCurrentPage] = useState(1);

  // Batas karakter alasan
  const REASON_MAX = 1000;
  const REASON_MIN = 10;

  // Tanggal minimum = hari ini (format YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  // Fetch data riwayat saat mount dan saat page berubah
  useEffect(() => {
    fetchMyRequests({ page: currentPage });
  }, [fetchMyRequests, currentPage]);

  // === Validasi form ===
  const validate = () => {
    const errors = {};

    if (!classificationId) {
      errors.classification = 'Klasifikasi wajib dipilih (sampai Level 3).';
    }
    if (!gapDate) {
      errors.gapDate = 'Tanggal gap wajib diisi.';
    } else if (gapDate < today) {
      errors.gapDate = 'Tanggal gap tidak boleh sebelum hari ini.';
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
        // Tampilkan nomor hanya jika status approved
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
  ];

  // === Styling helper ===
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
        <h1 className="text-2xl font-bold text-gray-900">📋 Gap Request</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ajukan permintaan nomor surat dari zona gap dan lihat riwayat request Anda.
        </p>
      </div>


      {/* ==================== BAGIAN ATAS — Form Request Baru ==================== */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Buat Request Baru</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ClassificationPicker — wajib, is_leaf=true */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          {/* Date picker — Tanggal Gap (minimal hari ini) */}
          <div>
            <label
              htmlFor="gap_date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tanggal Gap <span className="text-red-500">*</span>
            </label>
            <input
              id="gap_date"
              type="date"
              value={gapDate}
              onChange={(e) => setGapDate(e.target.value)}
              min={today}
              disabled={submitting}
              className={`${inputBaseClass} ${
                validationErrors.gapDate
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300'
              }`}
            />
            {validationErrors.gapDate && (
              <p className="mt-1 text-xs text-red-600">
                {validationErrors.gapDate}
              </p>
            )}
          </div>

          {/* Textarea — Alasan (wajib, min 10 karakter, counter karakter) */}
          <div>
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Alasan <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              rows={4}
              maxLength={REASON_MAX}
              placeholder="Jelaskan alasan Anda membutuhkan nomor dari zona gap (minimal 10 karakter)"
              className={`${inputBaseClass} resize-y ${
                validationErrors.reason
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300'
              }`}
            />
            <div className="flex items-center justify-between mt-1">
              {validationErrors.reason ? (
                <p className="text-xs text-red-600">{validationErrors.reason}</p>
              ) : (
                <span />
              )}
              <span
                className={`text-xs ${
                  reason.length >= REASON_MAX
                    ? 'text-red-500 font-medium'
                    : reason.length >= REASON_MAX * 0.9
                    ? 'text-amber-500'
                    : 'text-gray-400'
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
      </div>

      {/* ==================== BAGIAN BAWAH — Tabel Riwayat Request ==================== */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Request</h2>

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
      </div>
    </div>
  );
}
