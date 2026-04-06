import { useState, useEffect } from 'react';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import Table from '../../components/ui/Table';
import ErrorMessage from '../../components/ui/ErrorMessage';

/**
 * AdminDashboardPage — Halaman dashboard untuk role admin.
 *
 * Fitur:
 * - 4 summary card: surat hari ini, gap request pending, sequence aktif, user aktif
 * - Tabel 10 audit log terbaru
 * - Loading: skeleton card untuk setiap summary card
 */

/**
 * SkeletonCard — placeholder loading untuk summary card
 */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-2/3" />
          <div className="h-6 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

/**
 * SummaryCard — card ringkasan dengan ikon, label, dan nilai
 */
function SummaryCard({ icon, label, value, color, subtext }) {
  const colorSchemes = {
    indigo: {
      bg: 'bg-indigo-50',
      icon: 'text-indigo-600',
      value: 'text-indigo-900',
      border: 'border-indigo-100',
    },
    amber: {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      value: 'text-amber-900',
      border: 'border-amber-100',
    },
    emerald: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
      value: 'text-emerald-900',
      border: 'border-emerald-100',
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      value: 'text-purple-900',
      border: 'border-purple-100',
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.indigo;

  return (
    <div className={`bg-white rounded-xl border ${scheme.border} shadow-sm p-6 transition-all hover:shadow-md`}>
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${scheme.bg}`}>
          <span className={`text-2xl ${scheme.icon}`}>{icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {label}
          </p>
          <p className={`text-2xl font-bold ${scheme.value} mt-0.5`}>
            {value ?? '-'}
          </p>
          {subtext && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{subtext}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const {
    todayLetters,
    pendingGaps,
    activeUsers,
    cardsLoading,
    cardsError,
    auditLogs,
    logsLoading,
    logsError,
    fetchAll,
  } = useAdminDashboard();

  // State untuk total surat hari ini (dari summary response)
  const [letterCount, setLetterCount] = useState(0);

  // Format tanggal hari ini dalam bahasa Indonesia
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Fetch semua data saat mount
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Hitung jumlah surat dari summary data
  useEffect(() => {
    if (todayLetters) {
      // todayLetters bisa berupa { total_letters: N } atau { count: N } tergantung API
      setLetterCount(
        todayLetters.total_letters ?? todayLetters.count ?? todayLetters.total ?? 0
      );
    }
  }, [todayLetters]);

  // Kolom tabel audit log
  const auditColumns = [
    {
      key: 'created_at',
      label: 'Waktu',
      render: (value) => {
        if (!value) return '-';
        const date = new Date(value);
        return date.toLocaleString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    {
      key: 'user',
      label: 'User',
      render: (value) => (
        <span className="font-medium text-gray-900">
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
          create: 'bg-emerald-100 text-emerald-700',
          update: 'bg-blue-100 text-blue-700',
          delete: 'bg-red-100 text-red-700',
          void: 'bg-red-100 text-red-700',
          approve: 'bg-emerald-100 text-emerald-700',
          reject: 'bg-amber-100 text-amber-700',
          login: 'bg-indigo-100 text-indigo-700',
          logout: 'bg-gray-100 text-gray-700',
        };

        const colorClass = actionColors[value] || 'bg-gray-100 text-gray-700';

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
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
        <span className="max-w-[300px] truncate block text-gray-500" title={value}>
          {value || '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">🛡️ Admin Dashboard</h1>
        <p className="mt-1 text-indigo-100 text-sm">{today}</p>
      </div>

      {/* Cards error */}
      {cardsError && <ErrorMessage error={cardsError} />}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardsLoading ? (
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
              value={letterCount}
              color="indigo"
              subtext="Total nomor surat yang diambil hari ini"
            />
            <SummaryCard
              icon="⏳"
              label="Gap Request Pending"
              value={pendingGaps ?? 0}
              color="amber"
              subtext="Request yang menunggu persetujuan"
            />
            <SummaryCard
              icon="🔢"
              label="Sequence Aktif"
              value={todayLetters?.active_sequences ?? '-'}
              color="emerald"
              subtext="Sequence aktif hari ini"
            />
            <SummaryCard
              icon="👥"
              label="User Aktif"
              value={activeUsers ?? 0}
              color="purple"
              subtext="Total pengguna sistem yang aktif"
            />
          </>
        )}
      </div>

      {/* Tabel Aktivitas Terbaru */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            📋 Aktivitas Terbaru
          </h2>
          <span className="text-xs text-gray-400">10 log terakhir</span>
        </div>

        {logsError && <ErrorMessage error={logsError} />}

        <Table
          columns={auditColumns}
          data={auditLogs}
          loading={logsLoading}
          emptyText="Belum ada aktivitas tercatat."
        />
      </div>
    </div>
  );
}
