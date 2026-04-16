import { useState, useEffect } from 'react';
import { displayLetterNumber, displayClassification } from '../../utils/formatNumber';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getToday } from '../../api/sequences.api';
import { getMyLetters, getRecentLetters } from '../../api/letters.api';
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

  // State untuk riwayat singkat milik user
  const [recentLetters, setRecentLetters] = useState([]);
  const [recentError, setRecentError] = useState(null);

  // State untuk riwayat pengambilan nomor dari semua user
  const [allRecentLetters, setAllRecentLetters] = useState([]);
  const [allRecentError, setAllRecentError] = useState(null);

  const [globalSeq, setGlobalSeq] = useState(null);
  const latestTakenNumber = globalSeq?.last_number > 0
    ? globalSeq.next_number - 1
    : '-';

  // Stats for Ringkasan Cepat
  const [userStats, setUserStats] = useState({
    today: 0,
    month: 0,
    active: 0,
    total: 0
  });

  // Format tanggal hari ini dalam bahasa Indonesia
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Global loading state for entire dashboard data
  const [loading, setLoading] = useState(false);

  // Fetch all data on mount
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

        // Parallel fetch for all dashboard components
        const [
          recentRes,
          globalRes,
          allRecentRes,
          todayStats,
          monthStats,
          activeStats,
          totalStats
        ] = await Promise.all([
          getMyLetters({ per_page: 5 }),
          getToday().catch(() => ({ data: null })), // Silent catch for banner
          getRecentLetters({ limit: 10 }),
          getMyLetters({ issued_date_from: todayStr, issued_date_to: todayStr, per_page: 1 }),
          getMyLetters({ issued_date_from: firstDayOfMonth, per_page: 1 }),
          getMyLetters({ status: 'active', per_page: 1 }),
          getMyLetters({ per_page: 1 })
        ]);

        if (!cancelled) {
          setRecentLetters(recentRes.data || []);
          setGlobalSeq(globalRes.data);
          setAllRecentLetters(allRecentRes.data || []);
          setUserStats({
            today: todayStats.meta?.total || 0,
            month: monthStats.meta?.total || 0,
            active: activeStats.meta?.total || 0,
            total: totalStats.meta?.total || 0
          });
        }
      } catch (err) {
        if (!cancelled) {
          setRecentError(err.response?.data?.message || 'Gagal memuat data dashboard.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
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

  return (
    <div className="space-y-6">
      {/* ── Row 1: Header ── */}
      <div className="relative overflow-hidden rounded-3xl p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' }}
      >
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute top-1/2 -left-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Selamat datang, <span className="text-blue-400">{user?.name || 'User'}</span> 👋
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
            { label: 'Hari Ini', value: userStats.today, icon: '📅', color: 'bg-blue-50 text-blue-600' },
            { label: 'Bulan Ini', value: userStats.month, icon: '📊', color: 'bg-indigo-50 text-indigo-600' },
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

            {recentError && <ErrorMessage error={recentError} />}

            {!loading && !recentError && recentLetters.length > 0 && (
              <div className="divide-y divide-slate-50">
                {recentLetters.map((letter) => (
                  <div
                    key={letter.id}
                    className="flex items-center justify-between py-3.5 gap-4 group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-navy tracking-tight font-mono group-hover:text-blue-600 transition-colors">
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

            {!loading && !recentError && recentLetters.length === 0 && (
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

        {allRecentError && <ErrorMessage error={allRecentError} />}

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
