import { useState, useEffect, useCallback } from 'react';
import { getSequences, updateGap } from '../../api/sequences.api';
import ClassificationPicker from '../../components/ui/ClassificationPicker';
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
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Contoh Visual (default_start=1000, gap_size={gapSize})
      </p>
      <div className="space-y-2">
        {blocks.map((block) => (
          <div key={block.n} className="flex items-center gap-3 text-sm">
            <span className="text-xs text-gray-400 w-14 shrink-0">
              Blok {block.n}
            </span>
            <div className="flex gap-1 flex-1">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-medium">
                Aktif: {block.activeStart}–{block.activeEnd}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-100 text-amber-700 text-xs font-medium">
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

  // === Tabel sequence state ===
  const [sequences, setSequences] = useState([]);
  const [seqLoading, setSeqLoading] = useState(false);
  const [seqError, setSeqError] = useState(null);
  const [seqMeta, setSeqMeta] = useState(null);

  // === Filter state ===
  const [filterClassification, setFilterClassification] = useState(null);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Build filter params
  const buildParams = useCallback(
    (page = 1) => {
      const params = { page };
      if (filterClassification) params.classification_id = filterClassification;
      if (filterDateFrom) params.date_from = filterDateFrom;
      if (filterDateTo) params.date_to = filterDateTo;
      return params;
    },
    [filterClassification, filterDateFrom, filterDateTo]
  );

  // Fetch riwayat sequence
  const fetchSequences = useCallback(
    async (page = 1) => {
      setSeqLoading(true);
      setSeqError(null);

      try {
        const response = await getSequences(buildParams(page));
        setSequences(response.data || []);
        setSeqMeta(response.meta || null);

        // Jika response pertama punya info gap_size, set sebagai current value
        if (
          response.data?.length > 0 &&
          response.data[0].gap_size &&
          originalGapSize === 10
        ) {
          const currentGap = response.data[0].gap_size;
          setGapSize(currentGap);
          setOriginalGapSize(currentGap);
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
    setFilterClassification(null);
    setFilterDateFrom('');
    setFilterDateTo('');
    setCurrentPage(1);
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

  // Kolom tabel riwayat sequence
  const columns = [
    {
      key: 'date',
      label: 'Tanggal',
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
      key: 'classification',
      label: 'Klasifikasi',
      render: (value) => (
        <span className="text-gray-600">
          {value?.full_code || value?.code || '-'}
        </span>
      ),
    },
    {
      key: 'last_number',
      label: 'Nomor Terakhir',
      render: (value) => (
        <span className="font-medium text-gray-900">{value ?? '-'}</span>
      ),
    },
    {
      key: 'gap_size',
      label: 'Gap Size',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
          {value ?? '-'}
        </span>
      ),
    },
    {
      key: 'next_start',
      label: 'Next Start',
      render: (value) => (
        <span className="font-medium text-emerald-600">{value ?? '-'}</span>
      ),
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
        <h1 className="text-2xl font-bold text-gray-900">⚙️ Pengaturan Sequence</h1>
        <p className="mt-1 text-sm text-gray-500">
          Atur gap size global dan lihat riwayat sequence per klasifikasi.
        </p>
      </div>

      {/* ==================== BAGIAN ATAS — Gap Size Setting ==================== */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Gap Size Global</h2>

        {/* Input gap size */}
        <div className="max-w-xs">
          <label
            htmlFor="gap_size"
            className="block text-sm font-medium text-gray-700 mb-1"
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
        <div className="flex items-start gap-3 rounded-lg bg-blue-50 border border-blue-100 p-4">
          <svg
            className="h-5 w-5 text-blue-500 shrink-0 mt-0.5"
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
          <p className="text-sm text-blue-700">
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
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <svg
              className="h-5 w-5 text-emerald-500 shrink-0"
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
            <p className="text-sm text-emerald-700">{saveSuccess}</p>
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
          💾 Simpan
        </Button>
      </div>

      {/* ==================== BAGIAN BAWAH — Tabel Riwayat Sequence ==================== */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Riwayat Sequence</h2>

        {/* Filter card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Classification */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Klasifikasi
              </label>
              <ClassificationPicker
                value={filterClassification}
                onChange={setFilterClassification}
              />
            </div>

            {/* Date From */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
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
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
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
            <div className="flex gap-2">
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
