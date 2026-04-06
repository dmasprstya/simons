import { useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

/**
 * Pagination — Navigasi halaman dengan info data.
 *
 * Props:
 *   meta          — { current_page, last_page, total, per_page }
 *   onPageChange  — callback(pageNumber) saat halaman berubah
 */

/**
 * Hitung range halaman yang ditampilkan (max 5 halaman)
 */
function getPageNumbers(currentPage, lastPage) {
  const maxVisible = 5;
  const pages = [];

  if (lastPage <= maxVisible) {
    for (let i = 1; i <= lastPage; i++) pages.push(i);
  } else {
    // Hitung start & end agar current page di tengah
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > lastPage) {
      end = lastPage;
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
  }

  return pages;
}

export default function Pagination({ meta, onPageChange }) {
  const current_page = meta?.current_page ?? 1;
  const last_page = meta?.last_page ?? 1;
  const total = meta?.total ?? 0;
  const per_page = meta?.per_page ?? 10;

  // Hook harus dipanggil tanpa kondisi (Rules of Hooks)
  const pages = useMemo(
    () => getPageNumbers(current_page, last_page),
    [current_page, last_page]
  );

  if (!meta || last_page <= 1) return null;

  // Hitung "Menampilkan X-Y dari Z data"
  const from = (current_page - 1) * per_page + 1;
  const to = Math.min(current_page * per_page, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-3">
      {/* Info data */}
      <p className="text-sm text-gray-500">
        Menampilkan <span className="font-medium text-gray-700">{from}</span>–
        <span className="font-medium text-gray-700">{to}</span> dari{' '}
        <span className="font-medium text-gray-700">{total}</span> data
      </p>

      {/* Navigasi halaman */}
      <nav className="flex items-center gap-1" aria-label="Navigasi halaman">
        {/* Tombol Previous */}
        <button
          type="button"
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page <= 1}
          className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        {/* Angka halaman */}
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            disabled={page === current_page}
            className={`
              inline-flex items-center justify-center h-9 w-9 rounded-lg text-sm font-medium transition-colors
              ${
                page === current_page
                  ? 'bg-indigo-600 text-white shadow-sm cursor-default'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
            aria-current={page === current_page ? 'page' : undefined}
          >
            {page}
          </button>
        ))}

        {/* Tombol Next */}
        <button
          type="button"
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page >= last_page}
          className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Halaman berikutnya"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </nav>
    </div>
  );
}
