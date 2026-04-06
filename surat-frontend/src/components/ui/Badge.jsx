/**
 * Badge — Label status reusable dengan variant warna.
 *
 * Props:
 *   children  — teks/konten badge
 *   variant   — 'success' | 'warning' | 'danger' | 'info' | 'default'
 *   className — kelas tambahan
 */

const variantClasses = {
  success: 'bg-[#ECFDF5] text-[#065F46]',
  warning: 'bg-amber-50 text-amber-700',
  danger:  'bg-[#FEF2F2] text-[#991B1B]',
  info:    'bg-[#EBF4FD] text-[#185FA5]',
  default: 'bg-[#F7F9FC] text-[#64748B]',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center rounded px-2 py-0.5
        text-xs font-medium
        ${variantClasses[variant] || variantClasses.default}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
