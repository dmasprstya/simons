import { create } from 'zustand';

export const useClassificationStore = create((set, get) => ({
  roots: [],          // klasifikasi level 1
  childrenMap: {},    // { [parentId]: [...children] } — cache children per parent

  loading: false,

  // Set data root classifications
  setRoots: (roots) => set({ roots }),

  // Set children untuk parent tertentu (cache di childrenMap)
  setChildren: (parentId, children) =>
    set((state) => ({
      childrenMap: { ...state.childrenMap, [parentId]: children },
    })),

  // Ambil children dari cache berdasarkan parentId
  getChildren: (parentId) => get().childrenMap[parentId] || [],

  // Bersihkan semua cache klasifikasi
  clearCache: () => set({ roots: [], childrenMap: {} }),
}));
