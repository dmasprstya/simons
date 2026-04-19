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
    'bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-lg shadow-primary/20',
  secondary:
    'bg-secondary text-primary hover:bg-secondary-dark focus:ring-secondary shadow-md font-bold',
  outline:
    'bg-white text-primary border-2 border-primary/20 hover:border-primary hover:bg-primary/5 focus:ring-primary',
  danger:
    'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 focus:ring-red-400',
  ghost:
    'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-primary focus:ring-slate-400',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-lg gap-2',
  lg: 'px-7 py-3 text-base rounded-xl gap-3 h-12',
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
