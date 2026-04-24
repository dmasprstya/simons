import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

/**
 * ErrorMessage — Tampilkan pesan error dari API.
 *
 * Props:
 *   error — string | null
 *         Biasanya diambil dari error.response.data.message
 *         Jika null atau undefined, komponen tidak ditampilkan.
 */
export default function ErrorMessage({ error }) {
  if (!error) return null;

  return (
    <div
      className="flex items-start gap-3 rounded-lg border border-red-200 bg-[#FEF2F2] px-4 py-3"
      role="alert"
    >
      <ExclamationCircleIcon className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
      <p className="text-sm text-[#991B1B] leading-relaxed">{error}</p>
    </div>
  );
}
