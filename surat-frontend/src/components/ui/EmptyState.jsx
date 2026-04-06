/**
 * EmptyState — Komponen empty state yang ramah untuk tabel kosong.
 *
 * Props:
 *   icon        — emoji atau ikon (default: 📭)
 *   title       — judul utama (default: 'Belum ada data')
 *   description — deskripsi (default: null)
 *   action      — optional { label, onClick } untuk tombol CTA
 */
import Button from './Button';

export default function EmptyState({
  icon = '📭',
  title = 'Belum ada data',
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      {/* Ilustrasi lingkaran dengan ikon */}
      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gray-100 mb-4">
        <span className="text-4xl">{icon}</span>
      </div>

      <h3 className="text-base font-semibold text-gray-700 text-center">
        {title}
      </h3>

      {description && (
        <p className="mt-1 text-sm text-gray-400 text-center max-w-sm">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-4">
          <Button
            variant="primary"
            size="md"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
