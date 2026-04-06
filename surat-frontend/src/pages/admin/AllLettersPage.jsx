import { useState, useEffect, useCallback } from 'react';
import { useAdminLetters } from '../../hooks/useAdminLetters';
import { exportReport } from '../../api/reports.api';
import { useToast } from '../../hooks/useToast';
import ClassificationPicker from '../../components/ui/ClassificationPicker';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';
import StatusChip from '../../components/ui/StatusChip';
import ErrorMessage from '../../components/ui/ErrorMessage';

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
  const toast = useToast();

  // === Filter state ===
  const [search, setSearch] = useState('');
  const [classificationId, setClassificationId] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState('');
  const [division, setDivision] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // === Export state ===
  const [exporting, setExporting] = useState(null); // 'excel' | 'pdf' | null

  // Build params dari filter
  const buildParams = useCallback(
    (page = 1) => {
      const params = { page };
      if (search.trim()) params.search = search.trim();
      if (classificationId) params.classification_id = classificationId;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (status) params.status = status;
      if (division.trim()) params.division = division.trim();
      return params;
    },
    [search, classificationId, dateFrom, dateTo, status, division]
  );

  // Fetch data saat mount dan saat filter/page berubah
  useEffect(() => {
    fetchAllLetters(buildParams(currentPage));
  }, [fetchAllLetters, buildParams, currentPage]);

  // Handler ganti halaman
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handler apply filter
  const handleFilter = () => {
    setCurrentPage(1);
    fetchAllLetters(buildParams(1));
  };

  // Handler reset filter
  const handleResetFilter = () => {
    setSearch('');
    setClassificationId(null);
    setDateFrom('');
    setDateTo('');
    setStatus('');
    setDivision('');
    setCurrentPage(1);
    fetchAllLetters({ page: 1 });
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
      label: 'Nomor',
      render: (value) => (
        <span className="font-medium text-gray-900">
          {value}
        </span>
      ),
    },
    {
      key: 'classification',
      label: 'Klasifikasi',
      render: (value) => (
        <span className="text-gray-600">
          {value?.full_code || value?.code || '-'}
        </span>
      ),
    },
    {
      key: 'user',
      label: 'User',
      render: (value) => (
        <span className="font-medium text-gray-700">
          {value?.name || '-'}
        </span>
      ),
    },
    {
      key: 'division',
      label: 'Divisi',
      render: (value, row) => (
        <span className="text-gray-600">
          {value || row.user?.division || '-'}
        </span>
      ),
    },
    {
      key: 'subject',
      label: 'Perihal',
      render: (value) => (
        <span className="max-w-[180px] truncate block" title={value}>
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'destination',
      label: 'Tujuan',
      render: (value) => (
        <span className="max-w-[140px] truncate block" title={value}>
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
        return date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusChip status={value} />,
    },
  ];

  const inputBaseClass = `
    block w-full rounded-lg border border-gray-300 bg-white
    px-3 py-2 text-sm text-gray-900
    shadow-sm transition-colors
    focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none
  `;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📋 Semua Surat</h1>
          <p className="mt-1 text-sm text-gray-500">
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
          >
            📊 Export Excel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExport('pdf')}
            loading={exporting === 'pdf'}
            disabled={!!exporting}
          >
            📄 Export PDF
          </Button>
        </div>
      </div>


      {/* Filter card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
          {/* Search */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Cari User / Perihal
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ketik nama atau perihal..."
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

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputBaseClass}
            >
              <option value="">Semua</option>
              <option value="active">Aktif</option>
              <option value="voided">Dibatalkan</option>
            </select>
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
        </div>

        {/* Filter action buttons */}
        <div className="flex gap-2 mt-4">
          <Button variant="primary" size="md" onClick={handleFilter}>
            Filter
          </Button>
          <Button variant="secondary" size="md" onClick={handleResetFilter}>
            Reset
          </Button>
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
        emptyIcon="📄"
      />

      {/* Pagination */}
      <Pagination meta={meta} onPageChange={handlePageChange} />
    </div>
  );
}
