/**
 * Badge — Label status reusable dengan variant warna.
 *
 * Props:
 *   children  — teks/konten badge
 *   variant   — 'success' | 'warning' | 'danger' | 'info' | 'default'
 *   className — kelas tambahan
 */

const variantClasses = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  danger:  'bg-red-50 text-red-700 ring-red-600/20',
  info:    'bg-blue-50 text-blue-700 ring-blue-600/20',
  default: 'bg-gray-50 text-gray-600 ring-gray-500/20',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full px-2.5 py-0.5
        text-xs font-semibold
        ring-1 ring-inset
        ${variantClasses[variant] || variantClasses.default}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
