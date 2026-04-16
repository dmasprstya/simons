import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * ProtectedRoute — guard untuk halaman yang membutuhkan autentikasi.
 * Jika user belum login, redirect ke /login.
 *
 * Prop opsional:
 * - allowedRoles: string[] — jika disediakan, hanya role yang ada di array ini
 *   yang boleh mengakses. User terotentikasi dengan role lain di-redirect ke /unauthorized.
 */
export default function ProtectedRoute({ allowedRoles }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
