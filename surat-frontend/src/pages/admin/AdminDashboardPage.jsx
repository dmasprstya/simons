import { useEffect, useState } from 'react';
import { displayLetterNumber } from '../../utils/formatNumber';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { ShieldCheckIcon, DocumentTextIcon, ClockIcon, HashtagIcon, UsersIcon } from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import ErrorMessage from '../../components/ui/ErrorMessage';
import StatusChip from '../../components/ui/StatusChip';
import { getActionLabel, getDashboardActionColor } from '../../utils/auditLabels';

/**
 * AdminDashboardPage — Halaman dashboard untuk role admin.
 *
 * Performa: semua data diambil dalam satu request ke GET /api/dashboard/admin
 * (menggantikan 5 request terpisah: getSummary, getAllRequests, getUsers,
 * getRecentLetters, getLogs).
 */

function SkeletonCard() {
  return (
    <Card padding="md" className="animate-pulse">
      <div className="space-y-3">
        <div className="h-3 bg-slate-100 rounded-full w-2/3" />
        <div className="h-8 bg-slate-100 rounded-full w-1/3" />
      </div>
    </Card>
  );
}



function SummaryCard({ icon: Icon, label, value, subtext }) {
  return (
    <Card hover className="h-full">
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary-light text-primary shrink-0">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-bold text-navy mt-1">{value ?? '-'}</p>
          {subtext && (
            <p className="text-xs text-muted mt-1 truncate">{subtext}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

const COLORS = ['#1B2F6E', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'];

export default function AdminDashboardPage() {
  const {
    stats,
    allRecentLetters,
    auditLogs,
    trends,
    distributions,
    sequence,
    loading,
    error,
    fetchAll,
  } = useAdminDashboard();

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const [trendPeriod, setTrendPeriod] = useState('daily');

  useEffect(() => {
    fetchAll({ trend_period: trendPeriod });
  }, [fetchAll, trendPeriod]);

  // Transform trends data for charts
  const chartData = trends.map(t => {
    let dateLabel = t.date;
    try {
      if (trendPeriod === 'daily') {
        dateLabel = new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      } else if (trendPeriod === 'monthly') {
        const [year, month] = t.date.split('-');
        dateLabel = new Date(year, month - 1).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
      } else {
        dateLabel = t.date;
      }
    } catch (e) {
      dateLabel = t.date;
    }
    return {
      date: dateLabel,
      count: t.count
    };
  });

  const pieData = distributions.map(d => {
    // Buat singkatan: hapus prefix Bagian, Divisi, Bidang, Subbagian, Subbidang, Pelayanan
    const shortenedName = (d.name || 'Lainnya')
      .replace(/^(Bagian|Divisi|Bidang|Subbagian|Subbidang|Pelayanan|Kantor Wilayah)\s+/i, '')
      .trim();
    
    return {
      name: shortenedName,
      value: d.count
    };
  });

  // Jika request gagal total, tampilkan error + tombol retry di level dashboard
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-sm text-red-500 font-medium">{error}</p>
        <Button variant="primary" size="sm" onClick={fetchAll}>Coba Lagi</Button>
      </div>
    );
  }

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
            {value?.work_unit || '-'}
          </p>
        </div>
      ),
    },
    {
      key: 'classification',
      label: 'Klasifikasi',
      render: (value) => (
        <span className="bg-primary-light text-primary px-2 py-0.5 rounded text-xs font-bold">
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
      key: 'status',
      label: 'Status',
      render: (value, row) => <StatusChip status={value} source={row.source} />,
    },
  ];

  // Kolom tabel audit log
  const auditColumns = [
    {
      key: 'created_at',
      label: 'Waktu',
      render: (value) => {
        if (!value) return '-';
        const date = new Date(value);
        return (
          <span className="text-xs text-[#64748B]">
            {date.toLocaleString('id-ID', {
              weekday: 'long',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        );
      },
    },
    {
      key: 'user',
      label: 'User',
      render: (value) => (
        <span className="font-medium text-[#0B1F3A] text-xs">
          {value?.name || '-'}
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Aksi',
      render: (value) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getDashboardActionColor(value)}`}
        >
          {getActionLabel(value)}
        </span>
      ),
    },
  ];


  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{ background: 'linear-gradient(135deg, #1B2F6E 0%, #0F172A 100%)' }}
      >
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="h-8 w-8 text-white/80" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Dashboard</h1>
          </div>
          <p className="text-white/60 text-sm mt-2 font-medium">{today}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <SummaryCard
              icon={DocumentTextIcon}
              label="Surat Hari Ini"
              value={stats.today_letters}
              subtext="Nomor surat diambil hari ini"
            />
            <SummaryCard
              icon={ClockIcon}
              label="Pending Gap"
              value={stats.pending_gaps}
              subtext="Request menunggu persetujuan"
            />
            <SummaryCard
              icon={HashtagIcon}
              label="Total Surat"
              value={stats.total_letters}
              subtext="Total seluruh nomor yang terbit"
            />
            <SummaryCard
              icon={HashtagIcon}
              label="Nomor Terakhir"
              value={sequence?.last_number ?? '-'}
              subtext="Nomor surat global saat ini"
            />
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-navy">Tren Penomoran Surat</h2>
              <p className="text-xs text-muted">Statistik penerbitan nomor surat.</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
              {[
                { id: 'daily', label: 'Harian' },
                { id: 'monthly', label: 'Bulanan' },
                { id: 'yearly', label: 'Tahunan' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setTrendPeriod(p.id)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                    trendPeriod === p.id
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 w-full">
            {loading ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 10 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#F1F5F9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" fill="#1B2F6E" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted">
                Tidak ada data tren.
              </div>
            )}
          </div>
        </Card>

        {/* Distribution Chart */}
        <Card className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-navy">Distribusi Divisi</h2>
            <p className="text-xs text-muted">Sebaran nomor surat berdasarkan divisi.</p>
          </div>
          <div className="h-80 w-full">
            {loading ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="40%"
                    innerRadius={60}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => <span className="text-[10px] text-muted font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted">
                Tidak ada data klasifikasi.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Tabel Riwayat Pengambilan Nomor dari SEMUA User */}
      <Card className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-navy">Riwayat Pengambilan Nomor Terbaru</h2>
          <p className="text-xs text-muted mt-0.5">10 pengambilan nomor surat terakhir dari seluruh pengguna.</p>
        </div>

        <Table
          columns={recentAllColumns}
          data={allRecentLetters}
          loading={loading}
          emptyText="Belum ada riwayat pengambilan nomor surat."
          emptyIcon={ClockIcon}
        />
      </Card>

      {/* Tabel Aktivitas Terbaru (Audit Logs) */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-navy">Aktivitas Terbaru</h2>
            <p className="text-xs text-muted mt-0.5">10 log audit terakhir dari seluruh pengguna.</p>
          </div>
        </div>

        <Table
          columns={auditColumns}
          data={auditLogs}
          loading={loading}
          emptyText="Belum ada aktivitas tercatat."
        />
      </Card>
    </div>
  );
}
