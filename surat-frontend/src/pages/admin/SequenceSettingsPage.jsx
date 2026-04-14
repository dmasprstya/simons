import { useState, useEffect, useCallback } from 'react';
import { getSequences, updateGap, resetSequence } from '../../api/sequences.api';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';

/**
 * SequenceSettingsPage — Halaman pengaturan sequence (admin).
 *
 * Fitur:
 * - Input "Gap Size Global" (integer, min 1, max 100) + penjelasan + contoh visual
 * - Tombol "Simpan" → PATCH /sequences/gap
 * - Tabel riwayat sequence: Tanggal | Klasifikasi | Nomor Terakhir | Gap Size | Next Start
 * - Filter tabel: ClassificationPicker, date range
 */

/**
 * GapVisualizer — visualisasi blok gap berdasarkan gap size
 * Menampilkan contoh konkret 3 blok pertama
 */
function GapVisualizer({ gapSize }) {
  const defaultStart = 1000;
  const blocks = [];

  for (let n = 0; n < 3; n++) {
    const activeStart = defaultStart + n * (gapSize * 2);
    const activeEnd = activeStart + gapSize - 1;
    const gapStart = activeEnd + 1;
    const gapEnd = gapStart + gapSize - 1;

    blocks.push({ n: n + 1, activeStart, activeEnd, gapStart, gapEnd });
  }

  return (
    <div className="bg-[#F7F9FC] rounded-lg p-4 space-y-3">
      <p className="text-[10px] font-medium text-[#64748B] uppercase tracking-widest">
        Contoh Visual (default_start=1000, gap_size={gapSize})
      </p>
      <div className="space-y-2">
        {blocks.map((block) => (
          <div key={block.n} className="flex items-center gap-3 text-xs">
            <span className="text-[10px] text-[#94A3B8] w-12 shrink-0">
              Blok {block.n}
            </span>
            <div className="flex gap-1 flex-1">
              <span className="inline-flex items-center px-2 py-1 rounded bg-[#ECFDF5] text-[#065F46] text-xs font-medium">
                Aktif: {block.activeStart}–{block.activeEnd}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded bg-amber-50 text-amber-700 text-xs font-medium">
                Gap: {block.gapStart}–{block.gapEnd}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SequenceSettingsPage() {
  // === Gap size form state ===
  const [gapSize, setGapSize] = useState(10);
  const [originalGapSize, setOriginalGapSize] = useState(10);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);

  // === Reset sequence state ===
  const [resetNextStart, setResetNextStart] = useState(1000);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(null);

  // === Tabel sequence state ===
  const [sequences, setSequences] = useState([]);
  const [seqLoading, setSeqLoading] = useState(false);
  const [seqError, setSeqError] = useState(null);
  const [seqMeta, setSeqMeta] = useState(null);

  // === Filter state ===
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Build filter params
  const buildParams = useCallback(
    (page = 1) => {
      const params = { page };
      if (filterDateFrom) params.date_from = filterDateFrom;
      if (filterDateTo) params.date_to = filterDateTo;
      return params;
    },
    [filterDateFrom, filterDateTo]
  );

  // Fetch riwayat sequence
  const fetchSequences = useCallback(
    async (page = 1) => {
      setSeqLoading(true);
      setSeqError(null);

      try {
        const response = await getSequences(buildParams(page));

        // API mengembalikan satu object GlobalSequence (bukan array/paginated),
        // bungkus menjadi array agar Table dapat melakukan .map()
        const raw = response.data;
        const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
        setSequences(arr);
        setSeqMeta(response.meta || null);

        // Ambil gap_size dari response untuk sinkronisasi form
        if (raw?.gap_size && originalGapSize === 10) {
          setGapSize(raw.gap_size);
          setOriginalGapSize(raw.gap_size);
        }
      } catch (err) {
        const message =
          err.response?.data?.message || 'Gagal memuat riwayat sequence.';
        setSeqError(message);
        setSequences([]);
        setSeqMeta(null);
      } finally {
        setSeqLoading(false);
      }
    },
    [buildParams, originalGapSize]
  );

  // Fetch saat mount dan saat filter/page berubah
  useEffect(() => {
    fetchSequences(currentPage);
  }, [fetchSequences, currentPage]);

  // Handle ganti halaman
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle apply filter
  const handleFilter = () => {
    setCurrentPage(1);
    fetchSequences(1);
  };

  // Handle reset filter
  const handleResetFilter = () => {
    setFilterDateFrom('');
    setFilterDateTo('');
    setCurrentPage(1);
  };

  // Handle buka dialog konfirmasi reset
  const handleOpenReset = () => {
    if (!resetNextStart || resetNextStart < 1) {
      setResetError('Nomor awal harus minimal 1.');
      return;
    }
    setResetError(null);
    setResetConfirmText('');
    setShowResetConfirm(true);
  };

  // Handle eksekusi reset setelah konfirmasi
  const handleConfirmReset = async () => {
    if (resetConfirmText !== 'RESET') return;

    setResetting(true);
    setResetError(null);
    setResetSuccess(null);

    try {
      const payload = { next_start: resetNextStart };

      await resetSequence(payload);
      setShowResetConfirm(false);
      setResetConfirmText('');
      setResetSuccess(`Sequence berhasil direset. Penomoran dimulai dari nomor ${resetNextStart}.`);

      fetchSequences(1);
      setTimeout(() => setResetSuccess(null), 6000);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Gagal mereset sequence. Silakan coba lagi.');
    } finally {
      setResetting(false);
    }
  };

  // Handle simpan gap size
  const handleSaveGap = async () => {
    // Validasi
    if (!gapSize || gapSize < 1 || gapSize > 100) {
      setSaveError('Gap size harus antara 1 dan 100.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      await updateGap(gapSize);
      setOriginalGapSize(gapSize);
      setSaveSuccess('Gap size berhasil diperbarui. Perubahan berlaku mulai hari berikutnya.');

      // Refresh tabel
      fetchSequences(currentPage);

      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (err) {
      setSaveError(
        err.response?.data?.message || 'Gagal menyimpan gap size. Silakan coba lagi.'
      );
    } finally {
      setSaving(false);
    }
  };

  // Kolom tabel riwayat sequence (GlobalSequence: last_issued_date, last_number, gap_size, next_start)
  const columns = [
    {
      key: 'last_issued_date',
      label: 'Tanggal Terakhir',
      render: (value) => {
        if (!value) return <span className="text-xs text-[#94A3B8]">-</span>;
        const date = new Date(value + 'T00:00:00');
        return (
          <span className="text-xs text-[#64748B]">
            {date.toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        );
      },
    },
    {
      key: 'last_number',
      label: 'Nomor Terakhir',
      render: (value) => (
        <span className="font-semibold text-[#0B1F3A] font-mono">{value ?? '-'}</span>
      ),
    },
    {
      key: 'gap_size',
      label: 'Gap Size',
      render: (value) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#EBF4FD] text-[#185FA5]">
          {value ?? '-'}
        </span>
      ),
    },
    {
      key: 'next_start',
      label: 'Next Start',
      render: (value) => (
        <span className="font-semibold text-[#065F46] font-mono">{value ?? '-'}</span>
      ),
    },
  ];

  const inputBaseClass = `
    block w-full h-9 rounded-lg border border-[#E2E8F0] bg-[#F7F9FC]
    px-3 text-sm text-[#0B1F3A]
    transition-all duration-200
    focus:border-[#2A7FD4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2A7FD4]/20
  `;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-base font-semibold text-[#0B1F3A]">Pengaturan Sequence</h1>
        <p className="mt-0.5 text-sm text-[#64748B]">
          Atur gap size global dan lihat riwayat sequence per klasifikasi.
        </p>
      </div>

      {/* ==================== BAGIAN ATAS — Gap Size Setting ==================== */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#2A7FD4]"></span>
          <h2 className="text-xs uppercase tracking-widest text-[#64748B] font-semibold">Gap Size Global</h2>
        </div>

        {/* Input gap size */}
        <div className="max-w-xs">
          <label
            htmlFor="gap_size"
            className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1"
          >
            Ukuran Gap (1 – 100)
          </label>
          <input
            id="gap_size"
            type="number"
            min={1}
            max={100}
            value={gapSize}
            onChange={(e) => setGapSize(parseInt(e.target.value, 10) || '')}
            disabled={saving}
            className={inputBaseClass}
          />
        </div>

        {/* Penjelasan */}
        <div className="flex items-start gap-3 rounded-lg bg-[#EBF4FD] border border-[#2A7FD4]/10 p-3">
          <svg
            className="h-4 w-4 text-[#2A7FD4] shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
            />
          </svg>
          <p className="text-xs text-[#185FA5]">
            Perubahan gap size berlaku mulai <strong>hari berikutnya</strong> untuk
            sequence baru. Sequence yang sudah dibuat hari ini tidak terpengaruh.
          </p>
        </div>

        {/* Contoh visual — hanya tampil jika gapSize valid */}
        {gapSize >= 1 && gapSize <= 100 && (
          <GapVisualizer gapSize={gapSize} />
        )}

        {/* Save error */}
        {saveError && <ErrorMessage error={saveError} />}

        {/* Save success */}
        {saveSuccess && (
          <div className="flex items-center gap-3 rounded-lg border border-[#065F46]/10 bg-[#ECFDF5] px-4 py-3">
            <svg
              className="h-4 w-4 text-[#065F46] shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <p className="text-xs text-[#065F46]">{saveSuccess}</p>
          </div>
        )}

        {/* Tombol simpan */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleSaveGap}
          loading={saving}
          disabled={gapSize === originalGapSize}
        >
          Simpan
        </Button>
      </div>

      {/* ==================== BAGIAN TENGAH — Reset Penomoran ==================== */}
      <div className="bg-white rounded-xl border border-red-100 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-400"></span>
          <h2 className="text-xs uppercase tracking-widest text-[#64748B] font-semibold">Reset Penomoran</h2>
        </div>

        {/* Peringatan */}
        <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-3">
          <svg className="h-4 w-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <p className="text-xs text-red-700">
            Aksi ini <strong>tidak dapat dibatalkan</strong>. Zona gap yang sedang berjalan akan diarsipkan, lalu penomoran dimulai ulang dari nomor yang ditentukan.
          </p>
        </div>

        {/* Input field */}
        <div className="max-w-xs">
          <label htmlFor="reset_next_start" className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">
            Nomor Awal Baru <span className="text-red-500">*</span>
          </label>
          <input
            id="reset_next_start"
            type="number"
            min={1}
            value={resetNextStart}
            onChange={(e) => setResetNextStart(parseInt(e.target.value, 10) || '')}
            disabled={resetting}
            className={inputBaseClass}
          />
        </div>

        {/* Reset error */}
        {resetError && !showResetConfirm && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-xs text-red-700">{resetError}</p>
          </div>
        )}

        {/* Reset success */}
        {resetSuccess && (
          <div className="flex items-center gap-3 rounded-lg border border-[#065F46]/10 bg-[#ECFDF5] px-4 py-3">
            <svg className="h-4 w-4 text-[#065F46] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p className="text-xs text-[#065F46]">{resetSuccess}</p>
          </div>
        )}

        {/* Tombol buka konfirmasi */}
        {!showResetConfirm && (
          <button
            id="btn_open_reset_confirm"
            onClick={handleOpenReset}
            disabled={resetting || !resetNextStart}
            className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset Penomoran
          </button>
        )}

        {/* Dialog konfirmasi inline */}
        {showResetConfirm && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 space-y-3">
            <p className="text-xs text-red-800 font-semibold">
              Ketik <code className="bg-red-100 px-1 py-0.5 rounded font-mono font-bold">RESET</code> untuk mengonfirmasi:
            </p>
            <input
              id="reset_confirm_text"
              type="text"
              placeholder="Ketik RESET di sini"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              disabled={resetting}
              className={`${inputBaseClass} border-red-300 focus:border-red-500 focus:ring-red-200`}
            />
            {resetError && (
              <p className="text-xs text-red-700">{resetError}</p>
            )}
            <div className="flex gap-2">
              <button
                id="btn_confirm_reset"
                onClick={handleConfirmReset}
                disabled={resetConfirmText !== 'RESET' || resetting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetting ? 'Mereset...' : '✓ Ya, Reset Sekarang'}
              </button>
              <button
                id="btn_cancel_reset"
                onClick={() => { setShowResetConfirm(false); setResetError(null); }}
                disabled={resetting}
                className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-xs text-[#64748B] hover:bg-[#F7F9FC] transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== BAGIAN BAWAH — Tabel Riwayat Sequence ==================== */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#2A7FD4]"></span>
          <h2 className="text-xs uppercase tracking-widest text-[#64748B] font-semibold">Riwayat Sequence</h2>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-3">
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-start sm:items-end">
            {/* Date From */}
            <div className="w-full sm:w-36">
              <label className="block text-[10px] font-medium text-[#64748B] uppercase tracking-wide mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className={inputBaseClass}
              />
            </div>

            {/* Date To */}
            <div className="w-full sm:w-36">
              <label className="block text-[10px] font-medium text-[#64748B] uppercase tracking-wide mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className={inputBaseClass}
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
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
        {seqError && <ErrorMessage error={seqError} />}

        {/* Tabel sequence */}
        <Table
          columns={columns}
          data={sequences}
          loading={seqLoading}
          emptyText="Belum ada data sequence."
        />

        {/* Pagination */}
        <Pagination meta={seqMeta} onPageChange={handlePageChange} />
      </div>
    </div>
  );
}
