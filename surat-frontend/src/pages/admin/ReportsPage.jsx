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
 * - Export: CSV & PDF via blob download
 * - Loading state saat export: disable tombol + teks "Menyiapkan file..."
 */

/**
 * SkeletonCard — skeleton loader untuk summary card
 */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-[var(--radius-card)] border border-[#F1F5F9] p-6 shadow-sm animate-pulse">
      <div className="w-12 h-12 bg-[#F1F5F9] rounded-2xl mb-4" />
      <div className="h-3 bg-[#F1F5F9] rounded w-1/3 mb-3" />
      <div className="h-8 bg-[#F1F5F9] rounded w-1/2 mb-4" />
      <div className="h-2 bg-[#F1F5F9] rounded w-3/4" />
    </div>
  );
}

/**
 * SkeletonTable — skeleton loader untuk tabel breakdown
 */
function SkeletonTable() {
  return (
    <div className="bg-white rounded-[var(--radius-card)] border border-[#E2E8F0] p-8 animate-pulse space-y-6 shadow-sm">
      <div className="h-4 bg-[#F1F5F9] rounded w-1/4 mb-6" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 bg-[#F1F5F9] rounded w-1/2" />
            <div className="h-3 bg-[#F1F5F9] rounded w-12" />
          </div>
          <div className="h-2 bg-[#F1F5F9] rounded w-full" />
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
    <div className="bg-white rounded-[var(--radius-card)] p-6 border border-[#F1F5F9] shadow-[var(--shadow-soft)] transition-all hover:scale-[1.02] active:scale-[0.98]">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-[#F1F5F9]">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-[0.1em]">
          {label}
        </p>
        <p className="text-3xl font-extrabold text-[#1B2F6E] mt-1.5 tracking-tight">
          {value ?? '-'}
        </p>
        {subtext && (
          <p className="text-[11px] font-medium text-[#94A3B8] mt-2 flex items-center gap-1.5">
            <span className="w-1 h-1 bg-[#CBD5E1] rounded-full"></span>
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * BarChart — chart bar sederhana menggunakan CSS
 */
function SimpleBarChart({ data = [], labelKey = 'label', valueKey = 'count', title }) {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((item) => item[valueKey] || 0), 1);

  return (
    <div className="bg-white rounded-[var(--radius-card)] border border-[#E2E8F0] shadow-[var(--shadow-soft)] p-8 h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-extrabold text-[#1B2F6E] uppercase tracking-[0.05em]">{title}</h3>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] opacity-20"></div>
          <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] opacity-40"></div>
          <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] opacity-60"></div>
        </div>
      </div>
      <div className="space-y-6">
        {data.slice(0, 10).map((item, index) => {
          const value = item[valueKey] || 0;
          const percentage = (value / maxValue) * 100;

          return (
            <div key={index} className="group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#475569] group-hover:text-[#1B2F6E] transition-colors line-clamp-1">
                  {item[labelKey] || '-'}
                </span>
                <span className="text-xs font-extrabold text-[#1B2F6E] bg-[#F1F5F9] px-2 py-0.5 rounded-md">
                  {value}
                </span>
              </div>
              <div className="h-2.5 bg-[#F8FAFC] rounded-full overflow-hidden border border-[#F1F5F9]/50 shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
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
    '#1B2F6E, #2A469D', // primary blue
    '#F5B800, #FFD600', // secondary gold
    '#0EA5E9, #38BDF8', // sky
    '#6366F1, #818CF8', // indigo
    '#F43F5E, #FB7185', // rose
    '#10B981, #34D399', // emerald
  ];
  return colors[index % colors.length];
}

/**
 * BreakdownTable — tabel sederhana untuk breakdown data
 */
function BreakdownTable({ data = [], labelKey = 'label', valueKey = 'count', title, emptyText }) {
  return (
    <div className="bg-white rounded-[var(--radius-card)] border border-[#E2E8F0] shadow-[var(--shadow-soft)] overflow-hidden flex flex-col">
      <div className="px-8 py-5 border-b border-[#F1F5F9] bg-[#F8FAFC]/50">
        <h3 className="text-sm font-extrabold text-[#1B2F6E] uppercase tracking-wider">{title}</h3>
      </div>

      <div className="flex-1">
        {data.length === 0 ? (
          <div className="px-8 py-12 text-center">
            <span className="text-3xl block mb-3 opacity-50">📊</span>
            <p className="text-xs font-semibold text-[#94A3B8]">{emptyText || 'Tidak ada data.'}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F1F5F9]">
            {data.slice(0, 10).map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-8 py-4 hover:bg-[#F8FAFC] transition-all group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1] group-hover:bg-[var(--color-primary)] transition-colors shrink-0"></span>
                  <span className="text-xs font-bold text-[#475569] group-hover:text-[#1B2F6E] truncate transition-colors">
                    {item[labelKey] || '-'}
                  </span>
                </div>
                <span className="text-[13px] font-black text-[#1B2F6E] tabular-nums ml-4 bg-[#F1F5F9] min-w-[32px] h-6 flex items-center justify-center rounded-lg shadow-sm border border-[#E2E8F0]/30 px-2">
                  {item[valueKey] || 0}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {data.length > 10 && (
        <div className="px-8 py-3 bg-[#F8FAFC]/50 border-t border-[#F1F5F9] text-center">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Menampilkan Top 10</p>
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
  const [workUnit, setWorkUnit] = useState('');

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
    if (workUnit.trim()) params.work_unit = workUnit.trim();
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
    setWorkUnit('');
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
  const dailyBreakdown = (summary?.daily ?? summary?.per_day ?? []).map(item => ({
    ...item,
    formatted_date: item.date ? new Date(item.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'short' }) : '-'
  }));
  const classificationBreakdown = summary?.per_classification ?? summary?.by_classification ?? [];
  const workUnitBreakdown = summary?.per_work_unit ?? summary?.by_work_unit ?? [];

  const inputBaseClass = `
    block w-full h-11 rounded-[var(--radius-input)] border border-[#E2E8F0] bg-[#F8FAFC]
    px-4 text-sm text-[#1B2F6E] font-medium
    transition-all duration-200
    focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5
  `;

  return (
    <div className="space-y-8 pb-10">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-[var(--color-primary)] rounded-[var(--radius-card)] p-8 shadow-lg shadow-primary/10">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-secondary)]/10 rounded-full -ml-24 -mb-24 blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl items-center justify-center text-3xl shadow-inner border border-white/20">
              📊
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Laporan & Analitik</h1>
              <p className="text-white/60 text-sm font-medium mt-1">
                Visualisasi data penomoran dan ekspor laporan berkala.
              </p>
            </div>
          </div>

          {/* Export buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => onExport('csv')}
              loading={exporting === 'csv'}
              disabled={!!exporting}
              className="!bg-white/10 !text-white !border-white/10 hover:!bg-white/20 backdrop-blur-sm shadow-sm justify-center"
            >
              {exporting === 'csv' ? 'Menyiapkan...' : '📥 Export CSV'}
            </Button>
            <Button
              onClick={() => onExport('pdf')}
              loading={exporting === 'pdf'}
              disabled={!!exporting}
              className="!bg-[var(--color-secondary)] !text-[#1B2F6E] hover:opacity-90 shadow-md font-bold px-6 justify-center"
            >
              {exporting === 'pdf' ? 'Menyiapkan...' : '📄 Download PDF'}
            </Button>
          </div>
        </div>
      </div>

      {/* Export error */}
      {exportError && <ErrorMessage error={exportError} />}

      {/* Refined Filter Bar */}
      <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] border border-[#E2E8F0] p-5 md:p-8">
        <div className="flex items-center gap-2 mb-6 md:mb-8">
          <div className="w-1.5 h-6 bg-[var(--color-secondary)] rounded-full"></div>
          <h2 className="text-sm font-black text-[#1B2F6E] uppercase tracking-widest">Parameter Laporan</h2>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-10">
          {/* Left Side: Classification (7 cols) */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-3">
            <label className="block text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider ml-1">
              A. Filter Klasifikasi Surat
            </label>
            <ClassificationPicker
              value={classificationId}
              onChange={setClassificationId}
            />
          </div>

          {/* Right Side: Division, Dates, Actions (5 cols) */}
          <div className="lg:col-span-12 xl:col-span-5 flex flex-col">
            <div className="space-y-6 flex-1">
              <div>
                <label className="block text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider ml-1 mb-2">
                  B. Cari Unit Kerja
                </label>
                <input
                  type="text"
                  value={workUnit}
                  onChange={(e) => setWorkUnit(e.target.value)}
                  placeholder="Masukkan nama unit kerja..."
                  className={inputBaseClass}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider ml-1">
                  C. Rentang Waktu
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-[#94A3B8] font-bold ml-1">Tgl Mulai</span>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className={inputBaseClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-[#94A3B8] font-bold ml-1">Tgl Akhir</span>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className={inputBaseClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions (At the bottom of right side) */}
            <div className="flex gap-3 mt-10 pt-6 border-t border-[#F1F5F9]">
              <Button
                variant="outline"
                loading={loading}
                onClick={handleResetFilter}
                className="flex-1 h-12"
              >
                Reset Filter
              </Button>
              <Button
                variant="primary"
                loading={loading}
                onClick={handleFilter}
                className="flex-[2] h-12"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Tampilkan Laporan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error report load */}
      {error && <ErrorMessage error={error} />}

      {/* Summary Content */}
      <div className="space-y-8">
        {/* Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <StatCard
              icon="📄"
              label="Total Surat"
              value={totalLetters}
              subtext={`Periode ${dateFrom ? new Date(dateFrom + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' }) : '-'} - ${dateTo ? new Date(dateTo + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' }) : '-'}`}
            />
            <StatCard
              icon="🏷️"
              label="Klasifikasi"
              value={classificationBreakdown.length}
              subtext="Klasifikasi digunakan"
            />
            <StatCard
              icon="🏢"
              label="Unit Kerja"
              value={workUnitBreakdown.length}
              subtext="Unit Kerja berkontribusi"
            />
          </div>
        ) : null}

        {/* Detailed Breakdown */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SkeletonTable />
            <div className="space-y-8">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Primary Chart: Daily Trend */}
            <div className="lg:col-span-12 xl:col-span-7">
              {dailyBreakdown.length > 0 ? (
                <SimpleBarChart
                  data={dailyBreakdown}
                  labelKey="formatted_date"
                  valueKey="count"
                  title="📅 Tren Surat per Hari"
                />
              ) : (
                <div className="bg-white rounded-[var(--radius-card)] border border-[#E2E8F0] p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
                  <span className="text-4xl mb-4">📈</span>
                  <h3 className="text-[#1B2F6E] font-bold">Tren Harian Kosong</h3>
                  <p className="text-sm text-[#64748B] max-w-xs mt-1">Belum ada data surat yang terekam pada periode yang dipilih.</p>
                </div>
              )}
            </div>

            {/* Sidebar Tables */}
            <div className="lg:col-span-12 xl:col-span-5 space-y-8">
              <BreakdownTable
                data={classificationBreakdown}
                labelKey="classification"
                valueKey="count"
                title="🏷️ Top Klasifikasi"
                emptyText="Data klasifikasi tidak tersedia."
              />

              <BreakdownTable
                data={workUnitBreakdown}
                labelKey="work_unit"
                valueKey="count"
                title="🏢 Top Kontributor (Unit Kerja)"
                emptyText="Data unit kerja tidak tersedia."
              />
            </div>
          </div>
        ) : !error ? (
          <div className="bg-white rounded-[var(--radius-card)] border border-dashed border-[#CBD5E1] p-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-[#F1F5F9] rounded-full flex items-center justify-center text-3xl mb-4">
              📊
            </div>
            <h3 className="text-lg font-bold text-[#1B2F6E]">Siap Menganalisis Data</h3>
            <p className="text-[#64748B] text-sm mt-2 max-w-sm">
              Klik tombol filter di atas untuk menarik ringkasan data dan menghasilkan laporan visual.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

