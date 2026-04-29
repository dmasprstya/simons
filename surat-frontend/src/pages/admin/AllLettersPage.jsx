import { useState, useEffect, useCallback } from 'react';
import { displayLetterNumber } from '../../utils/formatNumber';
import { useAdminLetters } from '../../hooks/useAdminLetters';
import { useReports } from '../../hooks/useReports';
import { exportReport } from '../../api/reports.api';
import { useToast } from '../../hooks/useToast';
import ClassificationPicker from '../../components/ui/ClassificationPicker';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';
import StatusChip from '../../components/ui/StatusChip';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { DocumentChartBarIcon, DocumentIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

/**
 * AllLettersPage — Halaman admin: daftar semua surat seluruh user.
 *
 * Fitur:
 * - Tabel: Nomor | Klasifikasi | User | Divisi | Perihal | Tujuan | Tanggal | Status
 * - Filter: search, classification, date range, status, divisi
 * - Export: Excel & PDF
 * - Pagination
 */
export default function AllLettersPage() {
  const { letters, loading, error, meta, fetchAllLetters } = useAdminLetters();
  const { workUnits, fetchWorkUnits } = useReports();
  const toast = useToast();

  // === Filter state ===
  const [search, setSearch] = useState('');
  const [classificationId, setClassificationId] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState('');
  const [workUnit, setWorkUnit] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // === Export state ===
  const [exporting, setExporting] = useState(null); // 'excel' | 'pdf' | null

  // Applied filters (only trigger fetch when this state changes)
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    classificationId: null,
    dateFrom: '',
    dateTo: '',
    status: '',
    workUnit: '',
  });

  // Build params dari applied filter
  const buildParams = useCallback(
    (page = 1) => {
      const params = { page };
      if (appliedFilters.search.trim()) params.search = appliedFilters.search.trim();
      if (appliedFilters.classificationId) params.classification_id = appliedFilters.classificationId;
      if (appliedFilters.dateFrom) params.date_from = appliedFilters.dateFrom;
      if (appliedFilters.dateTo) params.date_to = appliedFilters.dateTo;
      if (appliedFilters.status) params.status = appliedFilters.status;
      if (appliedFilters.workUnit.trim()) params.work_unit = appliedFilters.workUnit.trim();
      return params;
    },
    [appliedFilters]
  );

  // Fetch data saat mount dan saat filter/page berubah
  useEffect(() => {
    fetchAllLetters(buildParams(currentPage));
  }, [fetchAllLetters, buildParams, currentPage]);

  useEffect(() => {
    fetchWorkUnits();
  }, [fetchWorkUnits]);

  // Handler ganti halaman
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handler apply filter
  const handleFilter = () => {
    setCurrentPage(1);
    setAppliedFilters({
      search,
      classificationId,
      dateFrom,
      dateTo,
      status,
      workUnit,
    });
  };

  // Handler reset filter
  const handleResetFilter = () => {
    setSearch('');
    setClassificationId(null);
    setDateFrom('');
    setDateTo('');
    setStatus('');
    setWorkUnit('');
    setCurrentPage(1);
    setAppliedFilters({
      search: '',
      classificationId: null,
      dateFrom: '',
      dateTo: '',
      status: '',
      workUnit: '',
    });
  };

  // Handler export
  const handleExport = async (format) => {
    setExporting(format);

    try {
      const params = { ...buildParams(1), format };
      delete params.page; // Export tidak perlu pagination
      await exportReport(params);

      toast.success(`File ${format.toUpperCase()} berhasil diunduh.`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || `Gagal mengekspor ${format.toUpperCase()}.`
      );
    } finally {
      setExporting(null);
    }
  };

  // Kolom tabel
  const columns = [
    {
      key: 'number',
      label: 'Nomor Surat',
      render: (_value, row) => (
        <span className="font-semibold text-[#0B1F3A] font-mono">
          {displayLetterNumber(row)}
        </span>
      ),
    },
    {
      key: 'classification',
      label: 'Klasifikasi',
      render: (value) => (
        <span className="bg-[#EBF4FD] text-[#185FA5] px-2 py-0.5 rounded text-xs font-medium">
          {value?.full_code || value?.code || '-'}
        </span>
      ),
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
      key: 'work_unit',
      label: 'Unit Kerja',
      render: (value, row) => (
        <span className="text-xs text-[#64748B]">
          {value || row.user?.work_unit || '-'}
        </span>
      ),
    },
    {
      key: 'subject',
      label: 'Perihal',
      render: (value) => (
        <span className="max-w-[180px] truncate block text-xs text-[#0B1F3A]" title={value}>
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'destination',
      label: 'Tujuan',
      render: (value) => (
        <span className="max-w-[140px] truncate block text-xs text-[#64748B]" title={value}>
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

  const inputBaseClass = `
    block w-full h-9 rounded-lg border border-[#E2E8F0] bg-[#F7F9FC]
    px-3 text-sm text-[#0B1F3A]
    transition-all duration-200
    focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20
  `;

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-base font-semibold text-[#0B1F3A]">Semua Surat</h1>
          <p className="mt-0.5 text-sm text-[#64748B]">
            Daftar seluruh surat dari semua user.
          </p>
        </div>

        {/* Export buttons */}
        <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('excel')}
              loading={exporting === 'excel'}
              disabled={!!exporting}
              className="flex items-center gap-2"
            >
              <DocumentChartBarIcon className="h-4 w-4" />
              <span>Export Excel</span>
            </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExport('pdf')}
            loading={exporting === 'pdf'}
            disabled={!!exporting}
            className="flex items-center gap-2"
          >
            <DocumentIcon className="h-4 w-4" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-3">
        <div className="flex flex-col lg:flex-row flex-wrap gap-2 items-start lg:items-end">
          {/* Search */}
          <div className="w-full lg:w-auto lg:flex-1 lg:min-w-[180px]">
            <label className="block text-[10px] font-medium text-[#64748B] uppercase tracking-wide mb-1">
              Cari User / Perihal
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
              placeholder="Ketik nama atau perihal..."
              className={inputBaseClass}
            />
          </div>

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

          <div className="w-full sm:w-32">
            <label className="block text-[10px] font-medium text-[#64748B] uppercase tracking-wide mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputBaseClass}
            >
              <option value="">Semua</option>
              <option value="active">Aktif</option>
              <option value="active_regular">Reguler</option>
              <option value="active_gap">Kosong</option>
            </select>
          </div>

          <div className="w-full sm:w-48">
            <label className="block text-[10px] font-medium text-[#64748B] uppercase tracking-wide mb-1">
              Unit Kerja
            </label>
            <select
              value={workUnit}
              onChange={(e) => setWorkUnit(e.target.value)}
              className={inputBaseClass}
            >
              <option value="">Semua Unit</option>
              {workUnits.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          {/* Filter action buttons */}
          <div className="flex gap-2 pt-1">
            <Button variant="primary" size="sm" onClick={handleFilter}>
              Filter
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetFilter}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && <ErrorMessage error={error} />}

      {/* Tabel surat */}
      <Table
        columns={columns}
        data={letters}
        loading={loading}
        emptyText="Belum ada data surat ditemukan."
        emptyIcon={DocumentTextIcon}
      />

      {/* Pagination */}
      <Pagination meta={meta} onPageChange={handlePageChange} />
    </div>
  );
}
