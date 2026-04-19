import { useState, useEffect } from 'react';
import { displayLetterNumber, displayClassification } from '../../utils/formatNumber';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getDashboardData } from '../../api/dashboard.api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ErrorMessage from '../../components/ui/ErrorMessage';
import StatusChip from '../../components/ui/StatusChip';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';

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
  const navigate = useNavigate();

  const [recentLetters, setRecentLetters] = useState([]);
  const [allRecentLetters, setAllRecentLetters] = useState([]);
  const [globalSeq, setGlobalSeq] = useState(null);
  const [userStats, setUserStats] = useState({ today: 0, month: 0, active: 0, total: 0 });

  // loading: true saat fetch pertama — skeleton ditampilkan
  // error: string jika request gagal total — tampilkan pesan + retry
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const latestTakenNumber = globalSeq?.last_number > 0
    ? globalSeq.last_number
    : '-';

  // Format tanggal hari ini dalam bahasa Indonesia
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // fetchData didefinisikan di component scope agar tombol retry bisa memanggilnya langsung
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardData();
      const d = res.data;
      setUserStats(d.stats);
      setRecentLetters(d.recent_letters || []);
      setAllRecentLetters(d.all_recent_letters || []);
      setGlobalSeq(d.sequence);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data dashboard.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount — cancelled flag mencegah setState setelah unmount
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getDashboardData();
        if (cancelled) return;
        const d = res.data;
        setUserStats(d.stats);
        setRecentLetters(d.recent_letters || []);
        setAllRecentLetters(d.all_recent_letters || []);
        setGlobalSeq(d.sequence);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Gagal memuat data dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
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
          <p className="text-xs font-medium text-primary truncate">
            {value?.name || '-'}
          </p>
          <p className="text-[10px] text-slate-400 truncate">
            {value?.division || '-'}
          </p>
        </div>
      ),
    },
    {
      key: 'classification',
      label: 'Klasifikasi',
      render: (value) => (
        <span className="bg-primary-light text-primary px-2 py-0.5 rounded text-xs font-bold">
          {displayClassification(value)}
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

  // Jika request gagal total, tampilkan error + tombol retry di level dashboard
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-sm text-red-500 font-medium">{error}</p>
        <Button variant="primary" size="sm" onClick={fetchData}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Row 1: Header ── */}
      <div className="relative overflow-hidden rounded-3xl p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' }}
      >
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/2 -left-10 h-32 w-32 rounded-full bg-secondary/10 blur-3xl" />

        <div className="relative">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Selamat datang, <span className="text-secondary">{user?.name || 'User'}</span> 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">{today}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 relative">
          {!loading && (
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl px-5 py-3 border border-slate-700/50 flex flex-col items-center justify-center min-w-[140px]">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                Nomor Terakhir
              </p>
              <p className="text-white text-3xl font-bold font-mono leading-none">
                {latestTakenNumber}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: Quick Action | Surat Terbaru ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stat Cards (Left Column) */}
        <div className="lg:col-span-4 space-y-4">
          {[
            { label: 'Hari Ini', value: userStats.today, icon: '📅', color: 'bg-primary-light text-primary' },
            { label: 'Bulan Ini', value: userStats.month, icon: '📊', color: 'bg-primary-light text-primary' },
            { label: 'Total Aktif', value: userStats.active, icon: '✅', color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Total Surat', value: userStats.total, icon: '📂', color: 'bg-slate-50 text-slate-600' }
          ].map((stat, idx) => (
            <Card key={idx} padding="md" hover>
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-2xl ${stat.color} flex items-center justify-center text-2xl shrink-0`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-[0.15em]">{stat.label}</p>
                  <p className="text-2xl font-bold text-navy mt-0.5">
                    {loading ? '...' : stat.value}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Surat Terbaru (Right Column) */}
        <div className="lg:col-span-8">
          <Card className="space-y-4 h-full">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-navy">Surat Terbaru Saya</h2>
                <p className="text-xs text-muted mt-0.5">Surat-surat terakhir yang Anda ambil.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/letters')}
              >
                Lihat Semua →
              </Button>
            </div>

            {loading && (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4 py-2.5">
                    <div className="h-3 bg-slate-100 rounded-full w-24" />
                    <div className="h-3 bg-slate-100 rounded-full flex-1" />
                    <div className="h-4 bg-slate-100 rounded-full w-14" />
                  </div>
                ))}
              </div>
            )}

            {/* error sudah ditangani di level dashboard — tidak perlu per-section error */}

            {!loading && recentLetters.length > 0 && (
              <div className="divide-y divide-slate-50">
                {recentLetters.map((letter) => (
                  <div
                    key={letter.id}
                    className="flex items-center justify-between py-3.5 gap-4 group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-navy tracking-tight font-mono group-hover:text-primary transition-colors">
                        {displayLetterNumber(letter)}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {letter.subject}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                        {new Date(letter.issued_date + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                      </span>
                      <StatusChip status={letter.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && recentLetters.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm text-muted">Belum ada surat yang diambil.</p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => navigate('/letters/take')}
                >
                  Ambil Nomor Pertama
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>


      {/* ── Row 4: Riwayat Table Full Width ── */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-navy">Riwayat Pengambilan Nomor Terbaru</h2>
            <p className="text-xs text-muted mt-0.5">
              10 pengambilan nomor surat terakhir dari seluruh pengguna.
            </p>
          </div>
          <Badge variant="info" className="px-3 py-1 text-[10px]">Global Activity</Badge>
        </div>

        {/* error sudah ditangani di level dashboard */}

        <Table
          columns={recentAllColumns}
          data={allRecentLetters}
          loading={loading}
          emptyText="Belum ada riwayat pengambilan nomor surat."
          emptyIcon="🕘"
        />
      </Card>
    </div>
  );
}
