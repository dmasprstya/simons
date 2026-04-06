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
    'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm',
  secondary:
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500 shadow-sm',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
  ghost:
    'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-indigo-500',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-base rounded-lg gap-2.5',
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
        inline-flex items-center justify-center font-medium
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
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
