/**
 * LoadingSpinner — Spinner sederhana untuk loading state halaman.
 *
 * Props:
 *   size ('sm' | 'md' | 'lg') — ukuran spinner
 *   className — kelas tambahan
 */

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-12 w-12 border-4',
};

export default function LoadingSpinner({ size = 'md', className = '' }) {
  return (
    <div
      className={`inline-block animate-spin rounded-full border-solid border-[#2A7FD4] border-t-transparent ${sizeMap[size] || sizeMap.md} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Memuat...</span>
    </div>
  );
}
