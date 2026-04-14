/**
 * Card — Container surface reusable dengan DNA VCEP-2026.
 *
 * Props:
 *   children   — konten card
 *   className  — kelas tambahan (override/extend)
 *   padding    — 'none' | 'sm' | 'md' | 'lg' (default: 'md')
 *   hover      — boolean — tambah hover lift effect
 *   as         — tag HTML (default: 'div')
 *
 * Standar: bg-white, rounded-3xl, shadow-card, border ringan.
 */

const paddingMap = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

export default function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  as: Tag = 'div',
}) {
  return (
    <Tag
      className={`
        bg-white rounded-3xl border border-slate-100
        shadow-[40px_40px_40px_0px_rgba(112,144,176,0.08)]
        ${paddingMap[padding] || paddingMap.md}
        ${hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)]' : ''}
        ${className}
      `}
    >
      {children}
    </Tag>
  );
}
