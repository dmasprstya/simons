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
    <div className="bg-[#F7F9FC] rounded-lg p-3 animate-pulse">
      <div className="h-3 bg-[#E2E8F0] rounded w-1/2 mb-3" />
      <div className="h-6 bg-[#E2E8F0] rounded w-1/3" />
    </div>
  );
}

/**
 * SkeletonTable — skeleton loader untuk tabel breakdown
 */
function SkeletonTable() {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 animate-pulse space-y-3">
      <div className="h-3 bg-[#E2E8F0] rounded w-1/3 mb-4" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-3 bg-[#E2E8F0] rounded flex-1" />
          <div className="h-3 bg-[#E2E8F0] rounded w-16" />
        </div>
      ))}
    </div>
  );
}

/**
 * StatCard — card ringkasan dengan value besar
 */
function StatCard({ icon, label, value, subtext }) {
  return (
    <div className="bg-[#F7F9FC] rounded-lg p-3 transition-all hover:bg-[#EBF4FD]/50">
      <div className="flex items-start gap-3">
        <span className="text-lg mt-0.5">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[#64748B] uppercase tracking-wide">
            {label}
          </p>
          <p className="text-xl font-semibold text-[#0B1F3A] mt-0.5">
            {value ?? '-'}
          </p>
          {subtext && (
            <p className="text-[10px] text-[#94A3B8] mt-0.5">{subtext}</p>
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
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
      {title && (
        <h3 className="text-xs uppercase tracking-widest text-[#64748B] font-semibold mb-4">{title}</h3>
      )}
      <div className="space-y-3">
        {data.map((item, index) => {
          const value = item[valueKey] || 0;
          const percentage = (value / maxValue) * 100;

          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#0B1F3A] truncate max-w-[60%]">
                  {item[labelKey] || '-'}
                </span>
                <span className="text-xs font-semibold text-[#0B1F3A]">
                  {value}
                </span>
              </div>
              <div className="h-2 bg-[#F7F9FC] rounded-full overflow-hidden">
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
    '#0B1F3A, #1A3558', // navy
    '#2A7FD4, #5BA2E0', // accent blue
    '#065F46, #34d399', // emerald
    '#f59e0b, #fbbf24', // amber
    '#185FA5, #5BA2E0', // blue
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
    <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
      {title && (
        <div className="px-5 py-3 border-b border-[#E2E8F0]">
          <h3 className="text-xs uppercase tracking-widest text-[#64748B] font-semibold">{title}</h3>
        </div>
      )}

      {data.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <span className="text-2xl block mb-2">📊</span>
          <p className="text-xs text-[#94A3B8]">{emptyText || 'Tidak ada data.'}</p>
        </div>
      ) : (
        <div className="divide-y divide-[#E2E8F0]">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-5 py-2.5 hover:bg-[#F7F9FC] transition-colors"
            >
              <span className="text-xs text-[#0B1F3A] truncate">
                {item[labelKey] || '-'}
              </span>
              <span className="text-xs font-bold text-[#0B1F3A] tabular-nums ml-4">
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
    block w-full h-9 rounded-lg border border-[#E2E8F0] bg-[#F7F9FC]
    px-3 text-sm text-[#0B1F3A]
    transition-all duration-200
    focus:border-[#2A7FD4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2A7FD4]/20
  `;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-[#0B1F3A] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-white">📊 Laporan & Export</h1>
          <p className="text-white/50 text-sm mt-0.5">
            Ringkasan data surat dan export laporan.
          </p>
        </div>

        {/* Export buttons */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onExport('excel')}
            loading={exporting === 'excel'}
            disabled={!!exporting}
            className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20"
          >
            {exporting === 'excel' ? 'Menyiapkan...' : '📊 Export Excel'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onExport('pdf')}
            loading={exporting === 'pdf'}
            disabled={!!exporting}
            className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20"
          >
            {exporting === 'pdf' ? 'Menyiapkan...' : '📄 Export PDF'}
          </Button>
        </div>
      </div>

      {/* Export error */}
      {exportError && <ErrorMessage error={exportError} />}

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-3">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-start sm:items-end">
          {/* Date From */}
          <div className="w-full sm:w-36">
            <label className="block text-[10px] font-medium text-[#64748B] uppercase tracking-wide mb-1">
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
          <div className="w-full sm:w-36">
            <label className="block text-[10px] font-medium text-[#64748B] uppercase tracking-wide mb-1">
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
          <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[200px]">
            <label className="block text-[10px] font-medium text-[#64748B] uppercase tracking-wide mb-1">
              Klasifikasi
            </label>
            <ClassificationPicker
              value={classificationId}
              onChange={setClassificationId}
            />
          </div>

          {/* Divisi */}
          <div className="w-full sm:w-36">
            <label className="block text-[10px] font-medium text-[#64748B] uppercase tracking-wide mb-1">
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
          <div className="flex gap-2 pt-1">
            <button onClick={handleFilter} className="bg-[#2A7FD4] text-white rounded-lg h-9 px-4 text-xs font-semibold hover:bg-[#2571BF] transition-colors">
              Filter
            </button>
            <button onClick={handleResetFilter} className="border border-[#E2E8F0] rounded-lg h-9 px-4 text-xs text-[#64748B] hover:bg-[#F7F9FC] transition-colors">
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && <ErrorMessage error={error} />}

      {/* Summary cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            subtext={`${dateFrom} — ${dateTo}`}
          />
          <StatCard
            icon="🏷️"
            label="Klasifikasi"
            value={classificationBreakdown.length}
            subtext="Jumlah klasifikasi yang digunakan"
          />
          <StatCard
            icon="🏢"
            label="Divisi"
            value={divisionBreakdown.length}
            subtext="Jumlah divisi yang mengirim surat"
          />
        </div>
      ) : null}

      {/* Charts / Breakdown */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
