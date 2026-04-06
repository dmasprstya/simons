/**
 * Table — Tabel data reusable dengan loading skeleton dan empty state.
 *
 * Props:
 *   columns      — array of { key, label, render? }
 *                   render(value, row) untuk custom rendering kolom
 *   data         — array of row objects
 *   loading      — boolean, tampilkan skeleton rows
 *   emptyText    — teks saat data kosong
 *   emptyIcon    — emoji/ikon untuk empty state (default: 📭)
 *   emptyAction  — optional { label, onClick } untuk tombol CTA di empty state
 */

/**
 * SkeletonRow — baris placeholder animasi pulse saat loading
 */
function SkeletonRow({ colCount }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded-md w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export default function Table({
  columns = [],
  data = [],
  loading = false,
  emptyText = 'Tidak ada data',
  emptyIcon = '📭',
  emptyAction,
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Head */}
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

        {/* Body */}
        <tbody className="divide-y divide-gray-100">
          {/* Loading state — 3 baris skeleton placeholder */}
          {loading &&
            [0, 1, 2].map((i) => (
              <SkeletonRow key={`skeleton-${i}`} colCount={columns.length} />
            ))}

          {/* Empty state — tampilkan ilustrasi + teks ramah */}
          {!loading && data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-16 text-center"
              >
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-3">
                    <span className="text-3xl">{emptyIcon}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    {emptyText}
                  </p>
                  {emptyAction && (
                    <button
                      onClick={emptyAction.onClick}
                      className="mt-3 inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      {emptyAction.label}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          )}

          {/* Data rows */}
          {!loading &&
            data.map((row, rowIndex) => (
              <tr
                key={row.id ?? rowIndex}
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap"
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
