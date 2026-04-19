import Modal from './Modal';
import Button from './Button';

/**
 * ConfirmDialog — Dialog konfirmasi sebelum aksi destruktif (void surat, reject gap request).
 *
 * Props:
 *   isOpen       — boolean, tampilkan/sembunyikan dialog
 *   onClose      — callback saat dialog ditutup
 *   onConfirm    — callback saat aksi dikonfirmasi
 *   title        — judul dialog
 *   message      — pesan konfirmasi
 *   confirmLabel — label tombol konfirmasi (default: "Konfirmasi")
 *   loading      — boolean, loading state tombol konfirmasi
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin ingin melanjutkan?',
  confirmLabel = 'Konfirmasi',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {/* Ikon peringatan & pesan */}
      <div className="flex flex-col items-center text-center gap-3 py-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FEF2F2]">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <p className="text-sm text-[#64748B] leading-relaxed">{message}</p>
      </div>

      {/* Tombol aksi */}
      <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0] mt-2">
        <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button variant="danger" size="md" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
