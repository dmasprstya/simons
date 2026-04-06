import { create } from 'zustand';

/**
 * useToast — global toast notification state via Zustand.
 *
 * Fitur:
 *   - addToast(type, message, duration?) — tambahkan toast baru
 *   - success(message) — shortcut untuk toast sukses
 *   - error(message)   — shortcut untuk toast error
 *   - warning(message) — shortcut untuk toast peringatan
 *   - info(message)    — shortcut untuk toast info
 *   - dismiss(id)      — tutup toast tertentu
 *   - clearAll()       — tutup semua toast
 *
 * Default auto-dismiss: 4000ms
 * Max active toasts: 5 (FIFO)
 */

let toastId = 0;
const MAX_TOASTS = 5;

export const useToast = create((set) => ({
  toasts: [],

  addToast: (type, message, duration = 4000) => {
    const id = ++toastId;

    set((state) => {
      // Limit jumlah toast aktif — hapus yang paling lama
      const existing = state.toasts.length >= MAX_TOASTS
        ? state.toasts.slice(1)
        : state.toasts;

      return {
        toasts: [...existing, { id, type, message, duration }],
      };
    });

    return id;
  },

  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => set({ toasts: [] }),

  // === Shortcut methods ===
  success: (message, duration) => {
    const { addToast } = useToast.getState();
    return addToast('success', message, duration);
  },

  error: (message, duration) => {
    const { addToast } = useToast.getState();
    return addToast('error', message, duration);
  },

  warning: (message, duration) => {
    const { addToast } = useToast.getState();
    return addToast('warning', message, duration);
  },

  info: (message, duration) => {
    const { addToast } = useToast.getState();
    return addToast('info', message, duration);
  },
}));
