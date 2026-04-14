import { useState, useEffect, useCallback } from 'react';
import { displayLetterNumber } from '../../utils/formatNumber';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useSequenceStore } from '../../store/sequenceStore';
import { getToday } from '../../api/sequences.api';
import { getMyLetters, getRecentLetters } from '../../api/letters.api';
import ClassificationPicker from '../../components/ui/ClassificationPicker';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ErrorMessage from '../../components/ui/ErrorMessage';
import StatusChip from '../../components/ui/StatusChip';
import Table from '../../components/ui/Table';

/**
 * DashboardPage — Halaman utama untuk role user.
 *
 * Fitur:
 * - Greeting dengan nama user + tanggal hari ini
 * - Card info sequence hari ini (pilih klasifikasi → fetch sequence)
 * - Tombol "Ambil Nomor Sekarang"
 * - Card riwayat singkat 5 surat terakhir milik user
 * - Tabel riwayat pengambilan nomor terbaru dari SEMUA user
 */
export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { setSequence } = useSequenceStore();
  const navigate = useNavigate();

  // State untuk sequence hari ini
  const [selectedClassification, setSelectedClassification] = useState(null);
  const [sequenceData, setSequenceData] = useState(null);
  const [sequenceLoading, setSequenceLoading] = useState(false);
  const [sequenceError, setSequenceError] = useState(null);

  // State untuk riwayat singkat milik user
  const [recentLetters, setRecentLetters] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState(null);

  // State untuk riwayat pengambilan nomor dari semua user
  const [allRecentLetters, setAllRecentLetters] = useState([]);
  const [allRecentLoading, setAllRecentLoading] = useState(false);
  const [allRecentError, setAllRecentError] = useState(null);

  // State untuk nomor global sequence (sumber kebenaran nomor terakhir di banner)
  const [globalSeq, setGlobalSeq] = useState(null);
  const [globalSeqLoading, setGlobalSeqLoading] = useState(false);
  const latestTakenNumber = globalSeq?.last_number > 0
    ? globalSeq.next_number - 1
    : '-';

  // Format tanggal hari ini dalam bahasa Indonesia
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Fetch sequence hari ini saat klasifikasi dipilih
  const fetchSequence = useCallback(
    async (classificationId) => {
      if (!classificationId) {
        setSequenceData(null);
        return;
      }

      setSequenceLoading(true);
      setSequenceError(null);

      try {
        const response = await getToday(classificationId);
        setSequenceData(response.data);
        // Simpan ke store global
        setSequence(classificationId, response.data);
      } catch (err) {
        const message =
          err.response?.data?.message || 'Gagal memuat data sequence. Silakan coba lagi.';
        setSequenceError(message);
        setSequenceData(null);
      } finally {
        setSequenceLoading(false);
      }
    },
    [setSequence]
  );

  // Handler saat pilih klasifikasi
  const handleClassificationChange = (classificationId) => {
    setSelectedClassification(classificationId);
    if (classificationId) {
      fetchSequence(classificationId);
    } else {
      setSequenceData(null);
      setSequenceError(null);
    }
  };

  // Fetch 5 surat terakhir milik user
  useEffect(() => {
    let cancelled = false;

    const fetchRecent = async () => {
      setRecentLoading(true);
      setRecentError(null);

      try {
        const response = await getMyLetters({ per_page: 5 });
        if (!cancelled) {
          setRecentLetters(response.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err.response?.data?.message || 'Gagal memuat riwayat surat.';
          setRecentError(message);
        }
      } finally {
        if (!cancelled) setRecentLoading(false);
      }
    };

    fetchRecent();
    return () => { cancelled = true; };
  }, []);

  // Fetch sequence global on mount untuk nomor terakhir di banner
  useEffect(() => {
    let cancelled = false;

    const fetchGlobalSeq = async () => {
      setGlobalSeqLoading(true);
      try {
        const response = await getToday();
        if (!cancelled) setGlobalSeq(response.data);
      } catch {
        // silent — banner cukup tampilkan '-'
      } finally {
        if (!cancelled) setGlobalSeqLoading(false);
      }
    };

    fetchGlobalSeq();
    return () => { cancelled = true; };
  }, []);

  // Fetch 10 riwayat pengambilan nomor terbaru dari semua user
  useEffect(() => {
    let cancelled = false;

    const fetchAllRecent = async () => {
      setAllRecentLoading(true);
      setAllRecentError(null);

      try {
        const response = await getRecentLetters({ limit: 10 });
        if (!cancelled) {
          setAllRecentLetters(response.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err.response?.data?.message || 'Gagal memuat riwayat pengambilan nomor.';
          setAllRecentError(message);
        }
      } finally {
        if (!cancelled) setAllRecentLoading(false);
      }
    };

    fetchAllRecent();
    return () => { cancelled = true; };
  }, []);

  // Kolom tabel riwayat pengambilan nomor semua user
  const recentAllColumns = [
    {
      key: 'number',
      label: 'Nomor Surat',
      render: (_value, row) => (
        <span className="font-semibold text-[#0B1F3A] font-mono">{displayLetterNumber(row)}</span>
      ),
    },
    {
      key: 'user',
      label: 'Pengambil',
      render: (value) => (
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#0B1F3A] truncate">
            {value?.name || '-'}
          </p>
          <p className="text-[10px] text-[#94A3B8] truncate">
            {value?.division || '-'}
          </p>
        </div>
      ),
    },
    {
      key: 'classification',
      label: 'Klasifikasi',
      render: (value) => (
        <span className="bg-[#EBF4FD] text-[#185FA5] px-2 py-0.5 rounded text-xs font-medium">
          {value?.code || '-'}
        </span>
      ),
    },
    {
      key: 'subject',
      label: 'Perihal',
      render: (value) => (
        <span className="max-w-[180px] truncate block text-xs text-[#64748B]" title={value}>
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'issued_date',
      label: 'Tanggal',
      render: (value) => {
        if (!value) return '-';
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
      key: 'status',
      label: 'Status',
      render: (value) => <StatusChip status={value} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Welcome banner ── */}
      <div className="relative overflow-hidden rounded-3xl p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{ background: 'linear-gradient(135deg, #4D7CFF 0%, #6366F1 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-white/10 blur-xl" />

        <div className="relative">
          <h1 className="text-2xl font-bold text-white">
            Selamat datang, {user?.name || 'User'} 👋
          </h1>
          <p className="text-white/60 text-sm mt-1">{today}</p>
        </div>

        {!globalSeqLoading && (
          <div className="relative bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-white/20">
            <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-1">
              Nomor Terakhir Diambil
            </p>
            <p className="text-white text-4xl font-bold font-mono leading-tight">
              {latestTakenNumber}
            </p>
          </div>
        )}
      </div>

      {/* Stat cards — 3 kolom (jika ada sequenceData) */}
      {sequenceData && !sequenceLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card padding="sm" className="text-center">
            <p className="text-xs text-muted uppercase tracking-widest font-semibold">Nomor Terakhir</p>
            <p className="text-2xl font-bold text-navy mt-1 font-mono">
              {sequenceData.last_number ?? '-'}
            </p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-xs text-muted uppercase tracking-widest font-semibold">Zona Aktif</p>
            <p className="text-lg font-bold text-navy mt-1 font-mono">
              {sequenceData.active_start ?? '-'} – {sequenceData.active_end ?? '-'}
            </p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-xs text-muted uppercase tracking-widest font-semibold">Zona Gap</p>
            <p className="text-lg font-bold text-navy mt-1 font-mono">
              {sequenceData.gap_start ?? '-'} – {sequenceData.gap_end ?? '-'}
            </p>
          </Card>
        </div>
      )}

      {/* Grid 2 kolom: Info Sequence | Surat Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card info sequence hari ini */}
        <Card className="space-y-5">
          <div>
            <h2 className="text-base font-bold text-navy">Info Sequence Hari Ini</h2>
            <p className="text-xs text-muted mt-0.5">Pilih klasifikasi untuk melihat status sequence.</p>
          </div>

          {/* ClassificationPicker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2">
              Pilih Klasifikasi
            </label>
            <ClassificationPicker
              value={selectedClassification}
              onChange={handleClassificationChange}
            />
          </div>

          {/* Loading skeleton */}
          {sequenceLoading && (
            <div className="space-y-3 animate-pulse">
              <div className="h-3 bg-slate-100 rounded-full w-3/4" />
              <div className="h-3 bg-slate-100 rounded-full w-1/2" />
              <div className="h-3 bg-slate-100 rounded-full w-2/3" />
            </div>
          )}

          {/* Error state */}
          {sequenceError && <ErrorMessage error={sequenceError} />}

          {/* Placeholder jika belum pilih klasifikasi */}
          {!selectedClassification && !sequenceLoading && (
            <p className="text-xs text-muted text-center py-4">
              Pilih klasifikasi di atas untuk melihat info sequence hari ini.
            </p>
          )}

          {/* Tombol Ambil Nomor */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/letters/take')}
            >
              Ambil Nomor Sekarang
            </Button>
          </div>
        </Card>

        {/* Card riwayat singkat milik user */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-navy">Surat Saya Terbaru</h2>
              <p className="text-xs text-muted mt-0.5">5 surat terakhir milik Anda.</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/letters')}
            >
              Lihat Semua →
            </Button>
          </div>

          {/* Loading skeleton */}
          {recentLoading && (
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 py-2">
                  <div className="h-3 bg-slate-100 rounded-full w-20" />
                  <div className="h-3 bg-slate-100 rounded-full flex-1" />
                  <div className="h-4 bg-slate-100 rounded-full w-14" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {recentError && <ErrorMessage error={recentError} />}

          {/* Daftar surat terbaru */}
          {!recentLoading && !recentError && recentLetters.length > 0 && (
            <div>
              {recentLetters.map((letter) => (
                <div
                  key={letter.id}
                  className="flex items-center justify-between py-3 gap-4 border-b border-slate-50 last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-navy truncate font-mono">
                      {displayLetterNumber(letter)}
                    </p>
                    <p className="text-xs text-muted truncate mt-0.5">
                      {letter.subject}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted">
                      {letter.issued_date}
                    </span>
                    <StatusChip status={letter.status} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!recentLoading && !recentError && recentLetters.length === 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-muted">Belum ada surat yang diambil.</p>
              <Button
                variant="primary"
                size="sm"
                className="mt-3"
                onClick={() => navigate('/letters/take')}
              >
                Ambil Nomor Pertama
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Tabel riwayat pengambilan nomor dari SEMUA user */}
      <Card className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-navy">Riwayat Pengambilan Nomor Terbaru</h2>
          <p className="text-xs text-muted mt-0.5">
            10 pengambilan nomor surat terakhir dari seluruh pengguna.
          </p>
        </div>

        {allRecentError && <ErrorMessage error={allRecentError} />}

        <Table
          columns={recentAllColumns}
          data={allRecentLetters}
          loading={allRecentLoading}
          emptyText="Belum ada riwayat pengambilan nomor surat."
          emptyIcon="🕘"
        />
      </Card>
    </div>
  );
}
