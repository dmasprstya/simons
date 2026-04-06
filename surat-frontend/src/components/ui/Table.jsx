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
        <td key={i} className="px-3 py-2">
          <div className="h-3 bg-[#E2E8F0] rounded w-3/4" />
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
    <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white">
      <table className="min-w-full min-w-[600px]">
        {/* Head */}
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

        {/* Body */}
        <tbody>
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
                className="px-3 py-12 text-center"
              >
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#F7F9FC] mb-3">
                    <span className="text-2xl">{emptyIcon}</span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    {emptyText}
                  </p>
                  {emptyAction && (
                    <button
                      onClick={emptyAction.onClick}
                      className="mt-3 inline-flex items-center px-3 py-1.5 text-xs font-medium text-[#2A7FD4] bg-[#EBF4FD] rounded-lg hover:bg-[#D6EBFC] transition-colors"
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
                className="hover:bg-[#F7F9FC] transition-colors border-b border-[#E2E8F0] last:border-b-0"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-3 py-2 text-xs text-[#0B1F3A] whitespace-nowrap"
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
