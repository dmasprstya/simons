import LoadingSpinner from './LoadingSpinner';

/**
 * Button — Komponen tombol reusable.
 *
 * Props:
 *   children     — konten tombol
 *   variant      — 'primary' | 'secondary' | 'danger' | 'ghost'
 *   size         — 'sm' | 'md' | 'lg'
 *   loading      — boolean, tampilkan spinner & disable klik
 *   disabled     — boolean
 *   onClick      — handler klik
 *   type         — tipe tombol HTML ('button' | 'submit' | 'reset')
 *   className    — kelas tambahan
 */

const variantClasses = {
  primary:
    'bg-[#0B1F3A] text-white hover:bg-[#1E4A7A] focus:ring-[#2A7FD4] shadow-sm',
  secondary:
    'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F7F9FC] hover:text-[#0B1F3A] focus:ring-[#2A7FD4] shadow-sm',
  danger:
    'bg-[#FEF2F2] text-[#991B1B] hover:bg-red-100 focus:ring-red-400 border-0',
  ghost:
    'bg-transparent text-[#64748B] hover:bg-[#F7F9FC] hover:text-[#0B1F3A] focus:ring-[#2A7FD4]',
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs rounded gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-2.5 text-sm rounded-lg gap-2.5 h-10',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant] || variantClasses.primary}
        ${sizeClasses[size] || sizeClasses.md}
        ${className}
      `}
      {...rest}
    >
      {loading && <LoadingSpinner size="sm" className="border-current border-t-transparent" />}
      {children}
    </button>
  );
}
