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
      <p className="text-xs text-[#94A3B8] italic">Tidak ada data perubahan.</p>
    );
  }

  const oldObj = typeof oldData === 'string' ? tryParse(oldData) : (oldData || {});
  const newObj = typeof newData === 'string' ? tryParse(newData) : (newData || {});

  // Gabungkan semua keys dari old dan new
  const allKeys = [...new Set([...Object.keys(oldObj), ...Object.keys(newObj)])];

  if (allKeys.length === 0) {
    return (
      <p className="text-xs text-[#94A3B8] italic">Tidak ada data perubahan.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="border-b border-[#E2E8F0]">
            <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#64748B] uppercase w-32">
              Field
            </th>
            <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#991B1B] uppercase">
              Sebelum
            </th>
            <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#065F46] uppercase">
              Sesudah
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {allKeys.map((key) => {
            const oldVal = formatValue(oldObj[key]);
            const newVal = formatValue(newObj[key]);
            const isChanged = oldVal !== newVal;

            return (
              <tr
                key={key}
                className={isChanged ? 'bg-amber-50/50' : ''}
              >
                <td className="px-3 py-2 font-mono text-xs text-[#64748B] font-medium">
                  {key}
                </td>
                <td className={`px-3 py-2 font-mono text-xs break-all ${isChanged ? 'text-[#991B1B] line-through' : 'text-[#94A3B8]'}`}>
                  {oldVal || <span className="text-[#E2E8F0]">—</span>}
                </td>
                <td className={`px-3 py-2 font-mono text-xs break-all ${isChanged ? 'text-[#065F46] font-medium' : 'text-[#94A3B8]'}`}>
                  {newVal || <span className="text-[#E2E8F0]">—</span>}
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
    weekday: 'long',
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
  // Karena backend sudah mengirim dalam bahasa Indonesia, kita tinggal mengembalikan nilainya.
  // Map ini tetap ada untuk fallback atau jika ada key lama yang belum terupdate.
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
    'auth.login': 'Masuk',
  };
  return actionLabels[action] || action;
}

/**
 * Helper: warna badge untuk aksi
 */
function getActionColor(action) {
  const act = action?.toLowerCase() || '';
  if (act.includes('dibuat') || act.includes('disetujui') || act.includes('masuk') || act.includes('created') || act.includes('approved')) {
    return 'text-[#065F46] bg-[#ECFDF5]';
  }
  if (act.includes('dibatalkan') || act.includes('ditolak') || act.includes('dihapus') || act.includes('voided') || act.includes('rejected') || act.includes('deleted')) {
    return 'text-[#991B1B] bg-[#FEF2F2]';
  }
  if (act.includes('diperbarui') || act.includes('diubah') || act.includes('updated') || act.includes('toggled')) {
    return 'text-[#185FA5] bg-[#EBF4FD]';
  }
  if (act.includes('diminta') || act.includes('requested')) {
    return 'text-amber-700 bg-amber-50';
  }
  return 'text-[#64748B] bg-[#F7F9FC]';
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
      if (tableFilter.trim()) params.table_name = tableFilter.trim();
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
        <span className="text-[#64748B] text-xs whitespace-nowrap">
          {formatDateTime(value)}
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
      key: 'action',
      label: 'Aksi',
      render: (value) => (
        <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${getActionColor(value)}`}>
          {formatAction(value)}
        </span>
      ),
    },
    {
      key: 'table_name',
      label: 'Tabel',
      render: (value) => (
        <span className="font-mono text-xs text-[#64748B]">
          {value ? value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : ''}
        </span>
      ),
    },
    {
      key: 'record_id',
      label: 'Record ID',
      render: (value) => (
        <span className="font-mono text-xs text-[#64748B]">
          {value || ''}
        </span>
      ),
    },
    {
      key: 'ip_address',
      label: 'IP',
      render: (value) => (
        <span className="font-mono text-xs text-[#94A3B8]">
          {value || '-'}
        </span>
      ),
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
      <div>
        <h1 className="text-base font-semibold text-[#0B1F3A]">Audit Log</h1>
        <p className="mt-0.5 text-sm text-[#64748B]">
          Riwayat semua aksi penting yang dilakukan di sistem.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-3">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-start sm:items-end">
          {/* Search user */}
          <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[150px]">
            <label className="block text-[10px] font-medium text-[#64748B] uppercase tracking-wide mb-1">
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
          <div className="w-full sm:w-40">
            <label className="block text-[10px] font-medium text-[#64748B] uppercase tracking-wide mb-1">
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
          <div className="w-full sm:w-36">
            <label className="block text-[10px] font-medium text-[#64748B] uppercase tracking-wide mb-1">
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
        </div>

        <div className="flex gap-2 mt-3">
          <Button variant="primary" size="sm" onClick={handleFilter}>
            Filter
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetFilter}>
            Reset
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && <ErrorMessage error={error} />}

      {/* Tabel audit log — dengan klik baris */}
      <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white">
        <table className="min-w-full">
          <thead>
            <tr className="bg-[#F7F9FC]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-3 py-2 text-left text-[10px] font-semibold text-[#64748B] uppercase tracking-widest"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Loading state */}
            {loading &&
              [0, 1, 2].map((i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-2">
                      <div className="h-3 bg-[#E2E8F0] rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))}

            {/* Empty state */}
            {!loading && logs.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-12 text-center"
                >
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#F7F9FC] mb-3">
                      <span className="text-2xl">📝</span>
                    </div>
                    <p className="text-xs text-[#64748B]">
                      Belum ada aktivitas yang tercatat.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {/* Data rows — klik baris untuk buka detail */}
            {!loading &&
              logs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => handleRowClick(log)}
                  className="hover:bg-[#F7F9FC] transition-colors cursor-pointer border-b border-[#E2E8F0] last:border-b-0"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-3 py-2 text-xs text-[#0B1F3A] whitespace-nowrap"
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
            <span className="text-xs text-[#94A3B8]">Memuat detail...</span>
          </div>
        ) : selectedLog ? (
          <div className="space-y-5">
            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F7F9FC] rounded-lg p-3">
                <p className="text-[10px] font-medium text-[#64748B] uppercase">Waktu</p>
                <p className="text-xs text-[#0B1F3A] mt-0.5">{formatDateTime(selectedLog.created_at)}</p>
              </div>
              <div className="bg-[#F7F9FC] rounded-lg p-3">
                <p className="text-[10px] font-medium text-[#64748B] uppercase">User</p>
                <p className="text-xs text-[#0B1F3A] font-medium mt-0.5">{selectedLog.user?.name || '-'}</p>
              </div>
              <div className="bg-[#F7F9FC] rounded-lg p-3">
                <p className="text-[10px] font-medium text-[#64748B] uppercase">Aksi</p>
                <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium mt-0.5 ${getActionColor(selectedLog.action)}`}>
                  {formatAction(selectedLog.action)}
                </span>
              </div>
              <div className="bg-[#F7F9FC] rounded-lg p-3">
                <p className="text-[10px] font-medium text-[#64748B] uppercase">Tabel</p>
                <p className="text-xs font-mono text-[#0B1F3A] mt-0.5">
                  {selectedLog.table_name ? selectedLog.table_name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : ''}
                </p>
              </div>
              <div className="bg-[#F7F9FC] rounded-lg p-3">
                <p className="text-[10px] font-medium text-[#64748B] uppercase">Record ID</p>
                <p className="text-xs font-mono text-[#0B1F3A] mt-0.5">{selectedLog.record_id || ''}</p>
              </div>
              <div className="bg-[#F7F9FC] rounded-lg p-3">
                <p className="text-[10px] font-medium text-[#64748B] uppercase">IP Address</p>
                <p className="text-xs font-mono text-[#0B1F3A] mt-0.5">{selectedLog.ip_address || '-'}</p>
              </div>
              {selectedLog.user_agent && (
                <div className="col-span-2 bg-[#F7F9FC] rounded-lg p-3">
                  <p className="text-[10px] font-medium text-[#64748B] uppercase">User Agent</p>
                  <p className="text-[10px] font-mono text-[#64748B] break-all mt-0.5">{selectedLog.user_agent}</p>
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="border-t border-[#E2E8F0]" />

            {/* Old Data vs New Data diff */}
            <div>
              <h4 className="text-xs font-semibold text-[#0B1F3A] mb-3 flex items-center gap-2">
                <svg className="h-4 w-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                Perubahan Data
              </h4>
              <div className="rounded-lg border border-[#E2E8F0] overflow-hidden">
                <JsonDiff
                  oldData={selectedLog.old_data}
                  newData={selectedLog.new_data}
                />
              </div>
            </div>

            {/* Tombol tutup */}
            <div className="flex justify-end pt-2 border-t border-[#E2E8F0]">
              <Button variant="outline" size="md" onClick={handleCloseDetail}>
                Tutup
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#94A3B8] text-center py-8">
            Tidak dapat memuat detail audit log.
          </p>
        )}
      </Modal>
    </div>
  );
}
