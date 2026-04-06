/**
 * Table — Tabel data reusable dengan loading skeleton dan empty state.
 *
 * Props:
 *   columns   — array of { key, label, render? }
 *                render(value, row) untuk custom rendering kolom
 *   data      — array of row objects
 *   loading   — boolean, tampilkan skeleton rows
 *   emptyText — teks saat data kosong
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

          {/* Empty state — tampilkan emptyText di tengah tabel */}
          {!loading && data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-sm text-gray-400"
              >
                {emptyText}
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
