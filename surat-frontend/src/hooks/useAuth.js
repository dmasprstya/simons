import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { logout as logoutApi } from '../api/auth.api';

/**
 * useAuth — custom hook untuk akses state autentikasi.
 *
 * Export: { user, isAuthenticated, isAdmin, logout }
 * isAdmin = user?.role === 'admin'
 * logout: panggil API logout → clear store → navigate('/login')
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearAuth = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Tetap clear store meskipun API gagal
    } finally {
      clearAuth();
      navigate('/login', { replace: true });
    }
  }, [clearAuth, navigate]);

  return { user, isAuthenticated, isAdmin, logout };
}
