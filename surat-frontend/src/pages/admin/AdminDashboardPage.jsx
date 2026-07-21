import { useEffect, useState } from 'react';
import { displayLetterNumber } from '../../utils/formatNumber';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { ShieldCheckIcon, DocumentTextIcon, ClockIcon, HashtagIcon, UsersIcon } from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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



function SummaryCard({ icon: Icon, label, value, subtext, iconClass }) {
  return (
    <Card hover className="h-full">
      <div className="flex items-start gap-4">
        <div className={`flex items-center justify-center h-12 w-12 rounded-2xl shrink-0 ${iconClass}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-bold text-navy mt-1">{value ?? '-'}</p>
          {subtext && (
            <p className="text-xs text-muted mt-1">{subtext}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

const COLORS = ['#1B2F6E', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'];

function DonutChart({ data, colors }) {
  if (!data || data.length === 0) return null;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 85;
  const innerR = 55;
  const labelR = outerR + 18;
  const gap = 4;

  const slices = [];
  let currentAngle = -90;

  data.forEach((item, i) => {
    const pct = item.value / total;
    const sliceAngle = pct * 360 - gap;
    if (sliceAngle <= 0) return;

    const startAngle = currentAngle + gap / 2;
    const endAngle = startAngle + sliceAngle;
    const midAngle = startAngle + sliceAngle / 2;

    const toRad = (deg) => (deg * Math.PI) / 180;
    const largeArc = sliceAngle > 180 ? 1 : 0;

    const x1o = cx + outerR * Math.cos(toRad(startAngle));
    const y1o = cy + outerR * Math.sin(toRad(startAngle));
    const x2o = cx + outerR * Math.cos(toRad(endAngle));
    const y2o = cy + outerR * Math.sin(toRad(endAngle));
    const x1i = cx + innerR * Math.cos(toRad(endAngle));
    const y1i = cy + innerR * Math.sin(toRad(endAngle));
    const x2i = cx + innerR * Math.cos(toRad(startAngle));
    const y2i = cy + innerR * Math.sin(toRad(startAngle));

    const path = [
      `M ${x1o} ${y1o}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2o} ${y2o}`,
      `L ${x1i} ${y1i}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x2i} ${y2i}`,
      'Z',
    ].join(' ');

    const labelX = cx + labelR * Math.cos(toRad(midAngle));
    const labelY = cy + labelR * Math.sin(toRad(midAngle));
    const pctText = `${Math.round(pct * 100)}%`;

    slices.push(
      <g key={i}>
        <path d={path} fill={colors[i % colors.length]} />
        {pct >= 0.03 && (
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#1e293b"
            fontSize="12"
            fontWeight="700"
          >
            {pctText}
          </text>
        )}
      </g>
    );

    currentAngle += pct * 360;
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
      {slices}
    </svg>
  );
}

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

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const today = time.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const clock = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });

  const [trendPeriod, setTrendPeriod] = useState('weekly');

  useEffect(() => {
    fetchAll({ trend_period: trendPeriod });
  }, [fetchAll, trendPeriod]);

  // Transform trends data for charts
  const chartData = (() => {
    if (trendPeriod === 'weekly') {
      // Selalu tampilkan Senin–Jumat minggu ini, urut dari kiri ke kanan
      const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
      // Buat peta date-string → count dari data backend
      const dataMap = {};
      trends.forEach(t => { dataMap[t.date] = t.count; });
      // Hitung tanggal Senin minggu ini
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
      const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);
      return dayNames.map((name, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
        return { date: name, count: dataMap[key] ?? 0 };
      });
    }
    return trends.map(t => {
      let dateLabel = t.date;
      try {
        if (trendPeriod === 'monthly') {
          // Tampilkan nama bulan saja tanpa tahun/tanggal
          const [year, month] = t.date.split('-');
          dateLabel = new Date(year, month - 1).toLocaleDateString('id-ID', { month: 'long' });
        } else {
          dateLabel = t.date;
        }
      } catch (e) {
        dateLabel = t.date;
      }
      return { date: dateLabel, count: t.count };
    });
  })();

  const pieData = distributions.map(d => {
    return {
      name: d.name || 'Lainnya',
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
        <div className="relative w-fit">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="h-8 w-8 text-white/80" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Dashboard</h1>
          </div>
          <div className="flex justify-between mt-2 text-white/80 text-sm font-medium">
            <span>{today}</span>
            <span className="font-mono text-white/80 text-sm font-medium ml-2">{clock} WIB</span>
          </div>
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
              iconClass="bg-blue-50 text-blue-600"
            />
            <SummaryCard
              icon={ClockIcon}
              label="Pending Gap"
              value={stats.pending_gaps}
              subtext="Request menunggu persetujuan"
              iconClass="bg-amber-50 text-amber-600"
            />
            <SummaryCard
              icon={HashtagIcon}
              label="Total Surat"
              value={stats.total_letters}
              subtext="Total seluruh nomor yang terbit"
              iconClass="bg-emerald-50 text-emerald-600"
            />
            <SummaryCard
              icon={HashtagIcon}
              label="Nomor Terakhir"
              value={sequence?.last_number ?? '-'}
              subtext="Nomor surat global saat ini"
              iconClass="bg-violet-50 text-violet-600"
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
                { id: 'weekly', label: 'Harian' },
                { id: 'monthly', label: 'Bulanan' },
                { id: 'yearly', label: 'Tahunan' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setTrendPeriod(p.id)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${trendPeriod === p.id
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-52 w-full">
            {loading ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1B2F6E" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#1B2F6E" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
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
                    cursor={{ stroke: '#94A3B8', strokeDasharray: '3 3' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#1B2F6E"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#trendColor)"
                    dot={{ r: 4, fill: '#1B2F6E', strokeWidth: 2, stroke: '#FFFFFF' }}
                    activeDot={{ r: 6, fill: '#1B2F6E' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted">
                Tidak ada data tren.
              </div>
            )}
          </div>

          {!loading && chartData.length > 0 && (
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-2">
              {chartData.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 hover:bg-slate-100 transition-colors p-2 rounded-xl text-center flex flex-col justify-center border border-slate-100"
                >
                  <span className="text-[11px] font-medium text-slate-500 truncate">{item.date}</span>
                  <span className="text-sm font-bold text-navy mt-0.5">{item.count} <span className="text-[10px] font-normal text-slate-400">surat</span></span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Distribution Chart */}
        <Card className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-navy">Distribusi Divisi</h2>
            <p className="text-xs text-muted">Sebaran nomor surat berdasarkan divisi.</p>
          </div>
          <div className="flex justify-center" style={{ height: '220px' }}>
            {loading ? (
              <div className="w-48 h-48 bg-slate-50 animate-pulse rounded-full" />
            ) : pieData.length > 0 ? (
              <DonutChart data={pieData} colors={COLORS} />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted">
                Tidak ada data klasifikasi.
              </div>
            )}
          </div>
          {!loading && pieData.length > 0 && (
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0 mr-4">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-slate-600 font-medium truncate" title={entry.name}>
                      {entry.name}
                    </span>
                  </div>
                  <span className="font-bold text-navy shrink-0">{entry.value} surat</span>
                </div>
              ))}
            </div>
          )}
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
