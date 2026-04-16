import { useEffect } from 'react';
import { displayLetterNumber } from '../../utils/formatNumber';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import ErrorMessage from '../../components/ui/ErrorMessage';
import StatusChip from '../../components/ui/StatusChip';

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

function SummaryCard({ icon, label, value, subtext }) {
  return (
    <Card hover>
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-blue-50 text-2xl shrink-0">
          {icon}
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

export default function AdminDashboardPage() {
  const {
    stats,
    allRecentLetters,
    auditLogs,
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

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

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
      render: (value) => {
        // Mapping aksi ke badge warna
        const actionColors = {
          create: 'bg-[#ECFDF5] text-[#065F46]',
          update: 'bg-[#EBF4FD] text-[#185FA5]',
          delete: 'bg-[#FEF2F2] text-[#991B1B]',
          void: 'bg-[#FEF2F2] text-[#991B1B]',
          approve: 'bg-[#ECFDF5] text-[#065F46]',
          reject: 'bg-amber-50 text-amber-700',
          login: 'bg-[#EBF4FD] text-[#185FA5]',
          logout: 'bg-[#F7F9FC] text-[#64748B]',
        };

        const colorClass = actionColors[value] || 'bg-[#F7F9FC] text-[#64748B]';

        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}
          >
            {value || '-'}
          </span>
        );
      },
    },
    {
      key: 'description',
      label: 'Detail',
      render: (value) => (
        <span className="max-w-[300px] truncate block text-xs text-[#64748B]" title={value}>
          {value || '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{ background: 'linear-gradient(135deg, #4D7CFF 0%, #6366F1 100%)' }}
      >
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">🛡️ Admin Dashboard</h1>
          <p className="text-white/60 text-sm mt-1">{today}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
              icon="📄"
              label="Surat Hari Ini"
              value={stats.today_letters}
              subtext="Total nomor surat yang diambil hari ini"
            />
            <SummaryCard
              icon="⏳"
              label="Gap Request Pending"
              value={stats.pending_gaps}
              subtext="Request yang menunggu persetujuan"
            />
            <SummaryCard
              icon="🔢"
              label="Sequence Aktif"
              value={sequence?.next_number ?? '-'}
              subtext="Nomor berikutnya dalam antrian"
            />
            <SummaryCard
              icon="👥"
              label="User Aktif"
              value={stats.active_users}
              subtext="Total pengguna sistem yang aktif"
            />
          </>
        )}
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
          emptyIcon="🕘"
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
