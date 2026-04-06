import { useState, useEffect, useCallback } from 'react';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

/**
 * AuditLogsPage — Halaman admin: log audit.
 *
 * Fitur:
 * - Tabel: Waktu | User | Aksi | Tabel | Record ID | IP
 * - Klik baris → Modal detail (semua field + Old vs New data JSON diff)
 * - Filter: search user, filter aksi, filter tabel, date range
 * - Pagination 50 per halaman
 */

/**
 * JsonDiff — Komponen untuk menampilkan perbandingan old_data vs new_data.
 * Highlight field yang berbeda antara old dan new.
 */
function JsonDiff({ oldData, newData }) {
  // Jika keduanya kosong / null
  if (!oldData && !newData) {
    return (
      <p className="text-sm text-gray-400 italic">Tidak ada data perubahan.</p>
    );
  }

  const oldObj = typeof oldData === 'string' ? tryParse(oldData) : (oldData || {});
  const newObj = typeof newData === 'string' ? tryParse(newData) : (newData || {});

  // Gabungkan semua keys dari old dan new
  const allKeys = [...new Set([...Object.keys(oldObj), ...Object.keys(newObj)])];

  if (allKeys.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">Tidak ada data perubahan.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase w-32">
              Field
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-red-500 uppercase">
              Sebelum
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-emerald-600 uppercase">
              Sesudah
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {allKeys.map((key) => {
            const oldVal = formatValue(oldObj[key]);
            const newVal = formatValue(newObj[key]);
            const isChanged = oldVal !== newVal;

            return (
              <tr
                key={key}
                className={isChanged ? 'bg-amber-50/50' : ''}
              >
                <td className="px-3 py-2 font-mono text-xs text-gray-600 font-medium">
                  {key}
                </td>
                <td className={`px-3 py-2 font-mono text-xs break-all ${isChanged ? 'text-red-600 line-through' : 'text-gray-500'}`}>
                  {oldVal || <span className="text-gray-300">—</span>}
                </td>
                <td className={`px-3 py-2 font-mono text-xs break-all ${isChanged ? 'text-emerald-700 font-medium' : 'text-gray-500'}`}>
                  {newVal || <span className="text-gray-300">—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Helper: parse JSON string safely
 */
function tryParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}

/**
 * Helper: format value untuk tampilan diff
 */
function formatValue(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

/**
 * Helper: format tanggal-waktu ke format Indonesia
 */
function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Helper: mapping label aksi ke bahasa Indonesia yang lebih readable
 */
function formatAction(action) {
  const actionLabels = {
    'letter.created': 'Surat Dibuat',
    'letter.voided': 'Surat Dibatalkan',
    'gap.approved': 'Gap Disetujui',
    'gap.rejected': 'Gap Ditolak',
    'gap.requested': 'Gap Diminta',
    'user.created': 'User Dibuat',
    'user.updated': 'User Diperbarui',
    'user.toggled': 'Status User Diubah',
    'classification.created': 'Klasifikasi Dibuat',
    'classification.updated': 'Klasifikasi Diperbarui',
    'classification.toggled': 'Status Klasifikasi Diubah',
    'sequence.updated': 'Sequence Diperbarui',
  };
  return actionLabels[action] || action;
}

/**
 * Helper: warna badge untuk aksi
 */
function getActionColor(action) {
  if (action?.includes('created') || action?.includes('approved')) return 'text-emerald-700 bg-emerald-50';
  if (action?.includes('voided') || action?.includes('rejected')) return 'text-red-700 bg-red-50';
  if (action?.includes('updated') || action?.includes('toggled')) return 'text-blue-700 bg-blue-50';
  if (action?.includes('requested')) return 'text-amber-700 bg-amber-50';
  return 'text-gray-700 bg-gray-50';
}

export default function AuditLogsPage() {
  const {
    logs,
    loading,
    error,
    meta,
    selectedLog,
    detailLoading,
    fetchLogs,
    fetchLogDetail,
    clearSelectedLog,
  } = useAuditLogs();

  // === Filter state ===
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // === Modal detail state ===
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Build params dari filter
  const buildParams = useCallback(
    (page = 1) => {
      const params = { page, per_page: 50 };
      if (search.trim()) params.search = search.trim();
      if (actionFilter) params.action = actionFilter;
      if (tableFilter.trim()) params.auditable_type = tableFilter.trim();
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      return params;
    },
    [search, actionFilter, tableFilter, dateFrom, dateTo]
  );

  // Fetch data saat mount dan saat filter/page berubah
  useEffect(() => {
    fetchLogs(buildParams(currentPage));
  }, [fetchLogs, buildParams, currentPage]);

  // Handler ganti halaman
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handler apply filter
  const handleFilter = () => {
    setCurrentPage(1);
    fetchLogs(buildParams(1));
  };

  // Handler reset filter
  const handleResetFilter = () => {
    setSearch('');
    setActionFilter('');
    setTableFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
    fetchLogs({ page: 1, per_page: 50 });
  };

  // Handler klik baris → buka detail modal
  const handleRowClick = async (log) => {
    setShowDetailModal(true);
    await fetchLogDetail(log.id);
  };

  // Handler tutup detail modal
  const handleCloseDetail = () => {
    setShowDetailModal(false);
    clearSelectedLog();
  };

  // === Kolom tabel ===
  const columns = [
    {
      key: 'created_at',
      label: 'Waktu',
      render: (value) => (
        <span className="text-gray-600 text-xs whitespace-nowrap">
          {formatDateTime(value)}
        </span>
      ),
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
      render: (value) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getActionColor(value)}`}>
          {formatAction(value)}
        </span>
      ),
    },
    {
      key: 'auditable_type',
      label: 'Tabel',
      render: (value) => (
        <span className="font-mono text-xs text-gray-500">
          {value ? value.replace('App\\Models\\', '') : '-'}
        </span>
      ),
    },
    {
      key: 'auditable_id',
      label: 'Record ID',
      render: (value) => (
        <span className="font-mono text-xs text-gray-500">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'ip_address',
      label: 'IP',
      render: (value) => (
        <span className="font-mono text-xs text-gray-400">
          {value || '-'}
        </span>
      ),
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📝 Audit Log</h1>
        <p className="mt-1 text-sm text-gray-500">
          Riwayat semua aksi penting yang dilakukan di sistem.
        </p>
      </div>

      {/* Filter card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
          {/* Search user */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Cari User
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nama user..."
              className={inputBaseClass}
            />
          </div>

          {/* Aksi */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Aksi
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className={inputBaseClass}
            >
              <option value="">Semua</option>
              <option value="letter.created">Surat Dibuat</option>
              <option value="letter.voided">Surat Dibatalkan</option>
              <option value="gap.approved">Gap Disetujui</option>
              <option value="gap.rejected">Gap Ditolak</option>
            </select>
          </div>

          {/* Tabel */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Tabel
            </label>
            <input
              type="text"
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              placeholder="Nama model..."
              className={inputBaseClass}
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

      {/* Tabel audit log — dengan klik baris */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Loading state */}
            {loading &&
              [0, 1, 2].map((i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded-md w-3/4" />
                    </td>
                  ))}
                </tr>
              ))}

            {/* Empty state */}
            {!loading && logs.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-gray-400"
                >
                  Tidak ada data audit log.
                </td>
              </tr>
            )}

            {/* Data rows — klik baris untuk buka detail */}
            {!loading &&
              logs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => handleRowClick(log)}
                  className="hover:bg-indigo-50/50 transition-colors cursor-pointer"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap"
                    >
                      {col.render
                        ? col.render(log[col.key], log)
                        : log[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination meta={meta} onPageChange={handlePageChange} />

      {/* Modal Detail Audit Log */}
      <Modal
        isOpen={showDetailModal}
        onClose={handleCloseDetail}
        title="Detail Audit Log"
        size="lg"
      >
        {detailLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <LoadingSpinner size="md" />
            <span className="text-sm text-gray-400">Memuat detail...</span>
          </div>
        ) : selectedLog ? (
          <div className="space-y-6">
            {/* Info grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase mb-0.5">Waktu</p>
                <p className="text-sm text-gray-900">{formatDateTime(selectedLog.created_at)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase mb-0.5">User</p>
                <p className="text-sm text-gray-900 font-medium">{selectedLog.user?.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase mb-0.5">Aksi</p>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getActionColor(selectedLog.action)}`}>
                  {formatAction(selectedLog.action)}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase mb-0.5">Tabel</p>
                <p className="text-sm font-mono text-gray-600">
                  {selectedLog.auditable_type ? selectedLog.auditable_type.replace('App\\Models\\', '') : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase mb-0.5">Record ID</p>
                <p className="text-sm font-mono text-gray-600">{selectedLog.auditable_id || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase mb-0.5">IP Address</p>
                <p className="text-sm font-mono text-gray-600">{selectedLog.ip_address || '-'}</p>
              </div>
              {selectedLog.user_agent && (
                <div className="col-span-2">
                  <p className="text-xs font-medium text-gray-400 uppercase mb-0.5">User Agent</p>
                  <p className="text-xs font-mono text-gray-500 break-all">{selectedLog.user_agent}</p>
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="border-t border-gray-100" />

            {/* Old Data vs New Data diff */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                Perubahan Data
              </h4>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <JsonDiff
                  oldData={selectedLog.old_data}
                  newData={selectedLog.new_data}
                />
              </div>
            </div>

            {/* Tombol tutup */}
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <Button variant="secondary" size="md" onClick={handleCloseDetail}>
                Tutup
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">
            Tidak dapat memuat detail audit log.
          </p>
        )}
      </Modal>
    </div>
  );
}
