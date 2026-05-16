import { useMemo, useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

/**
 * Pagination — Navigasi halaman dengan info data.
 *
 * Props:
 *   meta          — { current_page, last_page, total, per_page }
 *   onPageChange  — callback(pageNumber) saat halaman berubah
 */

/**
 * Hitung range halaman yang ditampilkan (dengan ellipsis)
 */
function getPageNumbers(currentPage, lastPage, maxVisible = 5) {
  const pages = [];
  
  if (lastPage <= 7) {
    for (let i = 1; i <= lastPage; i++) pages.push(i);
    return pages;
  }

  // Always show first page
  pages.push(1);

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(lastPage - 1, currentPage + 1);

  if (start > 2) pages.push('...');

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < lastPage - 1) pages.push('...');

  // Always show last page
  pages.push(lastPage);

  return pages;
}

export default function Pagination({ 
  meta, 
  perPage,
  onPageChange, 
  onPerPageChange,
  maxVisible = 5, 
  labelMultiplier = 1 
}) {
  const current_page = meta?.current_page ?? 1;
  const last_page = meta?.last_page ?? 1;
  const total = meta?.total ?? 0;
  const server_per_page = meta?.per_page ?? 10;
  
  // Gunakan prop perPage jika ada, jika tidak fallback ke meta server
  const active_per_page = perPage ?? server_per_page;

  // Local state agar pengetikan lancar (tidak langsung terhapus jika input kosong saat mengetik)
  const [inputValue, setInputValue] = useState(active_per_page);

  // Sinkronisasi local state jika prop/meta berubah dari luar
  useEffect(() => {
    setInputValue(active_per_page);
  }, [active_per_page]);

  const pages = useMemo(
    () => getPageNumbers(current_page, last_page, maxVisible),
    [current_page, last_page, maxVisible]
  );

  if (!meta) return null;

  const from = total === 0 ? 0 : (current_page - 1) * active_per_page + 1;
  const to = Math.min(current_page * active_per_page, total);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val); // Update local state segera
  };

  const handleInputBlur = () => {
    const num = parseInt(inputValue);
    if (num > 0 && num !== active_per_page) {
      onPerPageChange(num);
    } else {
      setInputValue(active_per_page); // Reset jika tidak valid
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-1 py-3">
      <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
        <p className="text-xs text-[#64748B]">
          Menampilkan <span className="font-medium text-[#0B1F3A]">{from}</span>–
          <span className="font-medium text-[#0B1F3A]">{to}</span> dari{' '}
          <span className="font-medium text-[#0B1F3A]">{total}</span> data
        </p>

        {onPerPageChange && (
          <div className="flex items-center gap-2 border-l border-[#E2E8F0] pl-4 ml-2">
            <span className="text-xs text-[#64748B]">Per halaman:</span>
            <input
              type="number"
              min="1"
              max="500"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              className="w-16 h-7 rounded border border-[#E2E8F0] bg-[#F7F9FC] px-2 text-xs text-[#0B1F3A] focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
        )}
      </div>

      <nav className="flex items-center gap-1" aria-label="Navigasi halaman">
        <button
          type="button"
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page <= 1}
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#64748B] hover:bg-[#F7F9FC] hover:text-[#0B1F3A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        {pages.map((page, idx) => {
          if (page === '...') {
            return (
              <span key={`dots-${idx}`} className="px-2 text-[#64748B] text-xs">...</span>
            );
          }
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              disabled={page === current_page}
              className={`
                inline-flex items-center justify-center h-8 min-w-[32px] px-2 rounded-lg text-xs font-medium transition-colors
                ${
                  page === current_page
                    ? 'bg-[#0B1F3A] text-white cursor-default'
                    : 'text-[#64748B] hover:bg-[#F7F9FC] hover:text-[#0B1F3A]'
                }
              `}
            >
              {page * labelMultiplier}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page >= last_page}
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#64748B] hover:bg-[#F7F9FC] hover:text-[#0B1F3A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}

