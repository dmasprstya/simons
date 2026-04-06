import { useState, useEffect } from 'react';
import { useReports } from '../../hooks/useReports';
import { useToast } from '../../hooks/useToast';
import ClassificationPicker from '../../components/ui/ClassificationPicker';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';

/**
 * ReportsPage — Halaman laporan dan export untuk admin.
 *
 * Fitur:
 * - Summary cards: total surat, breakdown per klasifikasi, breakdown per divisi
 * - Filter: date range, ClassificationPicker, divisi
 * - Export: Excel & PDF via blob download
 * - Loading state saat export: disable tombol + teks "Menyiapkan file..."
 */

/**
 * SkeletonCard — skeleton loader untuk summary card
 */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="h-8 bg-gray-200 rounded w-1/3" />
    </div>
  );
}

/**
 * SkeletonTable — skeleton loader untuk tabel breakdown
 */
function SkeletonTable() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-4 bg-gray-200 rounded flex-1" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

/**
 * StatCard — card ringkasan dengan value besar
 */
function StatCard({ icon, label, value, color = 'indigo', subtext }) {
  const colors = {
    indigo: {
      bg: 'bg-indigo-50',
      icon: 'text-indigo-600',
      value: 'text-indigo-900',
      border: 'border-indigo-100',
    },
    emerald: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
      value: 'text-emerald-900',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      value: 'text-amber-900',
      border: 'border-amber-100',
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      value: 'text-purple-900',
      border: 'border-purple-100',
    },
  };

  const c = colors[color] || colors.indigo;

  return (
    <div className={`bg-white rounded-xl border ${c.border} shadow-sm p-6 transition-all hover:shadow-md`}>
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.bg}`}>
          <span className={`text-2xl ${c.icon}`}>{icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {label}
          </p>
          <p className={`text-2xl font-bold ${c.value} mt-0.5`}>
            {value ?? '-'}
          </p>
          {subtext && (
            <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * BarChart — chart bar sederhana menggunakan CSS (tanpa library chart)
 * Menampilkan data sebagai horizontal bars dengan label dan value
 */
function SimpleBarChart({ data = [], labelKey = 'label', valueKey = 'count', title }) {
  if (!data || data.length === 0) return null;

  // Cari nilai maksimum untuk skala bar
  const maxValue = Math.max(...data.map((item) => item[valueKey] || 0), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {title && (
        <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="space-y-3">
        {data.map((item, index) => {
          const value = item[valueKey] || 0;
          const percentage = (value / maxValue) * 100;

          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700 truncate max-w-[60%]">
                  {item[labelKey] || '-'}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {value}
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, ${getBarColor(index)})`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Warna gradient untuk setiap bar berdasarkan index
 */
function getBarColor(index) {
  const colors = [
    '#6366f1, #818cf8', // indigo
    '#10b981, #34d399', // emerald
    '#f59e0b, #fbbf24', // amber
    '#8b5cf6, #a78bfa', // purple
    '#ec4899, #f472b6', // pink
    '#06b6d4, #22d3ee', // cyan
    '#f97316, #fb923c', // orange
    '#14b8a6, #2dd4bf', // teal
  ];
  return colors[index % colors.length];
}

/**
 * BreakdownTable — tabel sederhana untuk breakdown data
 */
function BreakdownTable({ data = [], labelKey = 'label', valueKey = 'count', title, emptyText }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
      )}

      {data.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <span className="text-3xl block mb-2">📊</span>
          <p className="text-sm text-gray-400">{emptyText || 'Tidak ada data.'}</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-700 truncate">
                {item[labelKey] || '-'}
              </span>
              <span className="text-sm font-bold text-gray-900 tabular-nums ml-4">
                {item[valueKey] || 0}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const { summary, loading, error, exporting, exportError, fetchSummary, handleExport } =
    useReports();
  const toast = useToast();

  // === Filter state ===
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [classificationId, setClassificationId] = useState(null);
  const [division, setDivision] = useState('');

  // Set default date range: 30 hari terakhir
  useEffect(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const to = now.toISOString().split('T')[0];
    const from = thirtyDaysAgo.toISOString().split('T')[0];

    setDateFrom(from);
    setDateTo(to);

    fetchSummary({ date_from: from, date_to: to });
  }, [fetchSummary]);

  // Update document title
  useEffect(() => {
    document.title = 'Laporan — Sistem Penomoran Surat';
    return () => { document.title = 'SIMONS — Sistem Penomoran Surat'; };
  }, []);

  // Build params dari filter
  const buildParams = () => {
    const params = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    if (classificationId) params.classification_id = classificationId;
    if (division.trim()) params.division = division.trim();
    return params;
  };

  // Handler apply filter
  const handleFilter = () => {
    fetchSummary(buildParams());
  };

  // Handler reset filter
  const handleResetFilter = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const to = now.toISOString().split('T')[0];
    const from = thirtyDaysAgo.toISOString().split('T')[0];

    setDateFrom(from);
    setDateTo(to);
    setClassificationId(null);
    setDivision('');
    fetchSummary({ date_from: from, date_to: to });
  };

  // Handler export dengan toast notification
  const onExport = async (format) => {
    const result = await handleExport(format, buildParams());
    if (result.success) {
      toast.success(`File ${format.toUpperCase()} berhasil diunduh.`);
    } else {
      toast.error(result.error || `Gagal mengekspor ${format.toUpperCase()}.`);
    }
  };

  // Parsing summary data
  const totalLetters = summary?.total_letters ?? summary?.total ?? 0;
  const dailyBreakdown = summary?.daily ?? summary?.per_day ?? [];
  const classificationBreakdown = summary?.per_classification ?? summary?.by_classification ?? [];
  const divisionBreakdown = summary?.per_division ?? summary?.by_division ?? [];

  const inputBaseClass = `
    block w-full rounded-lg border border-gray-300 bg-white
    px-3 py-2 text-sm text-gray-900
    shadow-sm transition-colors
    focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none
  `;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">📊 Laporan & Export</h1>
            <p className="mt-1 text-indigo-100 text-sm">
              Ringkasan data surat dan export laporan.
            </p>
          </div>

          {/* Export buttons */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => onExport('excel')}
              loading={exporting === 'excel'}
              disabled={!!exporting}
              className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20"
            >
              {exporting === 'excel' ? 'Menyiapkan file...' : '📊 Export Excel'}
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => onExport('pdf')}
              loading={exporting === 'pdf'}
              disabled={!!exporting}
              className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20"
            >
              {exporting === 'pdf' ? 'Menyiapkan file...' : '📄 Export PDF'}
            </Button>
          </div>
        </div>
      </div>

      {/* Export error */}
      {exportError && <ErrorMessage error={exportError} />}

      {/* Filter card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Date From */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
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
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={inputBaseClass}
            />
          </div>

          {/* Classification */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Klasifikasi
            </label>
            <ClassificationPicker
              value={classificationId}
              onChange={setClassificationId}
            />
          </div>

          {/* Divisi */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Divisi
            </label>
            <input
              type="text"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              placeholder="Nama divisi..."
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

      {/* Error */}
      {error && <ErrorMessage error={error} />}

      {/* Summary cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon="📄"
            label="Total Surat"
            value={totalLetters}
            color="indigo"
            subtext={`${dateFrom} — ${dateTo}`}
          />
          <StatCard
            icon="🏷️"
            label="Klasifikasi"
            value={classificationBreakdown.length}
            color="emerald"
            subtext="Jumlah klasifikasi yang digunakan"
          />
          <StatCard
            icon="🏢"
            label="Divisi"
            value={divisionBreakdown.length}
            color="purple"
            subtext="Jumlah divisi yang mengirim surat"
          />
        </div>
      ) : null}

      {/* Charts / Breakdown */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonTable />
          <SkeletonTable />
        </div>
      ) : summary ? (
        <>
          {/* Bar chart — Total surat per hari */}
          {dailyBreakdown.length > 0 && (
            <SimpleBarChart
              data={dailyBreakdown}
              labelKey="date"
              valueKey="count"
              title="📅 Total Surat per Hari"
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Breakdown per klasifikasi */}
            <BreakdownTable
              data={classificationBreakdown}
              labelKey="classification"
              valueKey="count"
              title="🏷️ Breakdown per Klasifikasi"
              emptyText="Belum ada data klasifikasi dalam rentang waktu ini."
            />

            {/* Breakdown per divisi */}
            <BreakdownTable
              data={divisionBreakdown}
              labelKey="division"
              valueKey="count"
              title="🏢 Breakdown per Divisi"
              emptyText="Belum ada data divisi dalam rentang waktu ini."
            />
          </div>
        </>
      ) : !error ? (
        <EmptyState
          icon="📊"
          title="Belum ada data laporan"
          description="Gunakan filter di atas untuk melihat ringkasan data surat."
        />
      ) : null}
    </div>
  );
}
