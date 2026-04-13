import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Set user & token setelah login berhasil
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      // Logout — hapus semua state auth
      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      // Update data user (misal setelah edit profil)
      updateUser: (user) => set({ user }),

      // Digunakan setelah update nama, divisi, atau foto berhasil
      updateProfile: (updatedUser) => set((state) => ({
          user: { ...state.user, ...updatedUser },
      })),
    }),
    { name: 'auth-storage' } // persist ke localStorage
  )
);
