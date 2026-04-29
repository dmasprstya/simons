import { useState, useEffect, useCallback } from 'react';
import { getSequences, updateGap } from '../../api/sequences.api';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';

/**
 * SequenceSettingsPage — Halaman pengaturan sequence (admin).
 *
 * Diperbarui: Menggunakan model Linear Daily Gap.
 */

/**
 * GapVisualizer — visualisasi gap harian
 */
function GapVisualizer({ gapSize }) {
  const currentLast = 1076;
  const gapStart = currentLast + 1;
  const gapEnd = currentLast + gapSize;
  const tomorrowStart = gapEnd + 1;

  return (
    <div className="bg-[#F7F9FC] rounded-lg p-4 space-y-3">
      <p className="text-[10px] font-medium text-[#64748B] uppercase tracking-widest">
        Ilustrasi Linear Gap (gap_size={gapSize})
      </p>
      <div className="space-y-4">
        {/* Hari Ini */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Hari Ini</span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded bg-[#ECFDF5] text-[#065F46] text-xs font-medium">
              Nomor Terakhir: {currentLast}
            </span>
            <div className="h-px bg-[#E2E8F0] flex-1"></div>
          </div>
        </div>

        {/* Rollover */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-amber-500 uppercase">Ganti Hari (Rollover)</span>
          <div className="flex items-center gap-2">
            <div className="flex-1 border-l-2 border-dashed border-amber-200 ml-4 pl-4 py-1">
              <span className="inline-flex items-center px-2 py-1 rounded bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100 italic">
                Gap Cadangan: {gapStart} – {gapEnd} ({gapSize} nomor)
              </span>
            </div>
          </div>
        </div>

        {/* Besok */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Besok</span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded bg-[#F0F9FF] text-[#0369A1] text-xs font-bold border border-[#BAE6FD]">
              Nomor Berikutnya: {tomorrowStart}
            </span>
            <div className="h-px bg-[#E2E8F0] flex-1"></div>
          </div>
        </div>
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
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch riwayat sequence
  const fetchSequences = useCallback(
    async (page = 1) => {
      setSeqLoading(true);
      setSeqError(null);

      try {
        const response = await getSequences({ page });

        const raw = response.data;
        // Backend mengembalikan object tunggal untuk global sequence saat ini
        const arr = raw ? [raw] : [];
        setSequences(arr);
        setSeqMeta(response.meta || null);

        // Ambil gap_size dari response untuk sinkronisasi form
        if (raw?.gap_size && originalGapSize === 10) {
          setGapSize(raw.gap_size);
          setOriginalGapSize(raw.gap_size);
        }
      } catch (err) {
        const message =
          err.response?.data?.message || 'Gagal memuat info sequence.';
        setSeqError(message);
        setSequences([]);
        setSeqMeta(null);
      } finally {
        setSeqLoading(false);
      }
    },
    [originalGapSize]
  );

  useEffect(() => {
    fetchSequences(currentPage);
  }, [fetchSequences, currentPage]);


  // Handle simpan gap size
  const handleSaveGap = async () => {
    if (!gapSize || gapSize < 0 || gapSize > 100) {
      setSaveError('Gap size harus antara 0 dan 100.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      await updateGap(gapSize);
      setOriginalGapSize(gapSize);
      setSaveSuccess('Gap size berhasil diperbarui.');

      fetchSequences(currentPage);
      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (err) {
      setSaveError(
        err.response?.data?.message || 'Gagal menyimpan gap size.'
      );
    } finally {
      setSaving(false);
    }
  };

  // Kolom tabel (GlobalSequence: last_issued_date, last_number, gap_size)
  const columns = [
    {
      key: 'last_issued_date',
      label: 'Tanggal Terakhir',
      render: (value) => {
        if (!value) return <span className="text-xs text-[#94A3B8]">Belum ada nomor</span>;
        const date = new Date(value.includes('T') ? value : value + 'T00:00:00');
        return (
          <span className="text-xs text-[#64748B]">
            {date.toLocaleDateString('id-ID', {
              weekday: 'long',
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
      label: 'Gap Size Harian',
      render: (value) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#EBF4FD] text-[#185FA5]">
          {value ?? '-'}
        </span>
      ),
    },
  ];

  const inputBaseClass = `
    focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20
  `;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-[#0B1F3A]">Pengaturan Sequence Global</h1>
          <p className="mt-0.5 text-sm text-[#64748B]">
            Kelola loncatan nomor (gap) harian untuk penomoran surat.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {/* ==================== LEFT — Gap Size Setting ==================== */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary"></span>
            <h2 className="text-xs uppercase tracking-widest text-primary font-bold">Gap Size Global</h2>
          </div>

          <p className="text-xs text-[#64748B] leading-relaxed">
            Jumlah nomor yang akan <strong>dilompati</strong> secara otomatis ketika hari berganti.
            Nomor yang dilompati ini akan tersimpan sebagai "Nomor Kosong" yang dapat diminta kembali.
          </p>

          <div className="space-y-4">
            <div className="max-w-xs">
              <label htmlFor="gap_size" className="block text-xs font-medium text-[#0B1F3A] mb-1">
                Ukuran Gap (0 – 100)
              </label>
              <input
                id="gap_size"
                type="number"
                min={0}
                max={100}
                value={gapSize}
                onChange={(e) => setGapSize(parseInt(e.target.value, 10) || 0)}
                disabled={saving}
                className={inputBaseClass}
              />
            </div>

            <GapVisualizer gapSize={gapSize || 0} />
          </div>

          {/* Messages */}
          {saveError && <ErrorMessage error={saveError} />}
          {saveSuccess && (
            <div className="rounded-lg border border-[#065F46]/10 bg-[#ECFDF5] px-4 py-3 text-xs text-[#065F46]">
              {saveSuccess}
            </div>
          )}

          <Button
            variant="primary"
            onClick={handleSaveGap}
            loading={saving}
            disabled={gapSize === originalGapSize}
          >
            Perbarui Gap Size
          </Button>
        </div>

      </div>

      {/* ==================== BOTTOM — Status Saat Ini ==================== */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary"></span>
          <h2 className="text-xs uppercase tracking-widest text-primary font-bold">Status Sequence Aktif</h2>
        </div>

        <Table
          columns={columns}
          data={sequences}
          loading={seqLoading}
          emptyText="Gagal memuat data sequence."
        />
      </div>
    </div>
  );
}
