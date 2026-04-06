import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Modal — Dialog modal dengan Portal ke document.body.
 *
 * Props:
 *   isOpen   — boolean, tampilkan/sembunyikan modal
 *   onClose  — callback saat modal ditutup
 *   title    — judul modal (string)
 *   children — konten modal
 *   size     — 'sm' | 'md' | 'lg'
 */

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  // Tutup modal saat tekan Escape
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Cegah scroll body saat modal terbuka
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop — klik untuk tutup */}
      <div
        className="fixed inset-0 bg-[#0B1F3A]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Konten modal */}
      <div
        className={`
          relative w-full ${sizeClasses[size] || sizeClasses.md}
          bg-white rounded-xl shadow-2xl border border-[#E2E8F0]
          transform transition-all
          animate-in fade-in zoom-in-95 duration-200
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h3 id="modal-title" className="text-base font-semibold text-[#0B1F3A]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#94A3B8] hover:text-[#0B1F3A] hover:bg-[#F7F9FC] transition-colors"
            aria-label="Tutup modal"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
