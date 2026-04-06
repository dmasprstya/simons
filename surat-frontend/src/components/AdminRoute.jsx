import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * AdminRoute — guard untuk halaman yang hanya bisa diakses role admin.
 * Jika user bukan admin, redirect ke /dashboard.
 * Asumsi: user sudah melewati ProtectedRoute (sudah terautentikasi).
 */
export default function AdminRoute() {
  const user = useAuthStore((state) => state.user);

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
