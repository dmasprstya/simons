import Modal from './Modal';
import Button from './Button';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

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
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
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
