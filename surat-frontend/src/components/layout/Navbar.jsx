import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { logout as logoutApi } from '../../api/auth.api';
import {
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Navbar — Bar navigasi atas.
 * Menampilkan nama user, divisi, dan tombol logout.
 * Logout: panggil API → clear store → redirect /login.
 */
export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutApi();
    } catch {
      // Tetap clear store meskipun API gagal (misal token expired)
    } finally {
      clearAuth();
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20">
      {/* Kiri — Halaman title / breadcrumb bisa ditambah nanti */}
      <div />

      {/* Kanan — Info user & logout */}
      <div className="flex items-center gap-4">
        {/* Info User */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-indigo-100 text-indigo-600">
            <UserCircleIcon className="h-6 w-6" />
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-400 leading-tight">
              {user?.division?.name || user?.role || '-'}
            </p>
          </div>
        </div>

        {/* Divider vertikal */}
        <div className="w-px h-8 bg-gray-200" />

        {/* Tombol Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Keluar"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span className="hidden sm:inline">{loggingOut ? 'Keluar...' : 'Keluar'}</span>
        </button>
      </div>
    </header>
  );
}
