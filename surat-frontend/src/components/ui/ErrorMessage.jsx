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
      <svg
        className="h-5 w-5 text-red-500 mt-0.5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
        />
      </svg>
      <p className="text-sm text-[#991B1B] leading-relaxed">{error}</p>
    </div>
  );
}
