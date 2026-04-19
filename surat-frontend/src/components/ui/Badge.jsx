/**
 * Badge — Label status reusable dengan variant warna.
 * VCEP-2026: Pill-shaped, soft background tones.
 *
 * Props:
 *   children  — teks/konten badge
 *   variant   — 'active' | 'success' | 'warning' | 'danger' | 'info' | 'default'
 *   className — kelas tambahan
 */

const variantClasses = {
  /* Status 'Active' — theme primary light pill */
  active: 'bg-primary-light text-primary ring-1 ring-primary/10',
  /* Umum */
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  warning: 'bg-amber-50  text-amber-700  ring-1 ring-amber-100',
  danger: 'bg-red-50    text-red-600    ring-1 ring-red-100',
  info: 'bg-primary-light text-primary ring-1 ring-primary/10',
  default: 'bg-slate-100 text-slate-500  ring-1 ring-slate-200',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        rounded-full px-2.5 py-0.5
        text-xs font-semibold tracking-wide
        ${variantClasses[variant] || variantClasses.default}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
