import { create } from 'zustand';

export const useSequenceStore = create((set) => ({
  sequences: {},  // { [classificationId]: DailySequenceResource }

  // Set data sequence untuk classification tertentu
  setSequence: (classificationId, data) =>
    set((state) => ({
      sequences: { ...state.sequences, [classificationId]: data },
    })),

  // Bersihkan semua data sequence (misal saat ganti hari)
  clearSequences: () => set({ sequences: {} }),
}));
