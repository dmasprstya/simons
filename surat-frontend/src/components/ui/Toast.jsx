import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

/**
 * Toast Item — individual toast notification.
 *
 * Props:
 *   id          — unique key
 *   type        — 'success' | 'error' | 'warning' | 'info'
 *   message     — teks notifikasi
 *   onDismiss   — callback(id) untuk menutup toast
 *   duration    — auto-dismiss dalam milidetik (default: 4000)
 */
function ToastItem({ id, type = 'success', message, onDismiss, duration = 4000 }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Slide-in saat mount
  useEffect(() => {
    // Trigger slide-in animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(showTimer);
  }, []);

  // Auto-dismiss
  useEffect(() => {
    if (duration <= 0) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    // Tunggu animasi slide-out selesai sebelum remove
    setTimeout(() => onDismiss(id), 300);
  }, [id, onDismiss]);

  const config = {
    success: {
      icon: CheckCircleIcon,
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      iconColor: 'text-emerald-500',
      textColor: 'text-emerald-800',
      progressColor: 'bg-emerald-400',
    },
    error: {
      icon: XCircleIcon,
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconColor: 'text-red-500',
      textColor: 'text-red-800',
      progressColor: 'bg-red-400',
    },
    warning: {
      icon: ExclamationTriangleIcon,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconColor: 'text-amber-500',
      textColor: 'text-amber-800',
      progressColor: 'bg-amber-400',
    },
    info: {
      icon: InformationCircleIcon,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconColor: 'text-blue-500',
      textColor: 'text-blue-800',
      progressColor: 'bg-blue-400',
    },
  };

  const c = config[type] || config.info;
  const Icon = c.icon;

  return (
    <div
      className={`
        relative overflow-hidden
        flex items-start gap-3 min-w-[320px] max-w-[420px]
        rounded-xl border shadow-lg backdrop-blur-sm
        px-4 py-3
        transition-all duration-300 ease-out
        ${c.bg} ${c.border}
        ${isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
        }
      `}
      role="alert"
    >
      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${c.iconColor}`} />
      <p className={`text-sm font-medium leading-relaxed flex-1 ${c.textColor}`}>
        {message}
      </p>
      <button
        onClick={handleDismiss}
        className="shrink-0 p-0.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-colors"
        aria-label="Tutup notifikasi"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>

      {/* Progress bar — visual auto-dismiss countdown */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/5">
          <div
            className={`h-full ${c.progressColor} rounded-full`}
            style={{
              animation: `toast-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * ToastContainer — container untuk menampilkan stack of toasts.
 * Diposisikan di kanan bawah layar.
 *
 * Props:
 *   toasts    — array of { id, type, message, duration? }
 *   onDismiss — callback(id) untuk menutup toast
 */
export default function ToastContainer({ toasts = [], onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <>
      {/* CSS animation untuk progress bar */}
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            onDismiss={onDismiss}
            duration={toast.duration}
          />
        ))}
      </div>
    </>
  );
}
