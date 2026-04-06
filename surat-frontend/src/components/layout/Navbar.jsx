import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { logout as logoutApi } from '../../api/auth.api';
import {
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

/**
 * Breadcrumb mapping — route path ke judul halaman.
 * Digunakan untuk menampilkan breadcrumb dan update document.title.
 */
const routeMap = {
  '/dashboard': { label: 'Dashboard', title: 'Dashboard' },
  '/letters/take': { label: 'Ambil Nomor', title: 'Ambil Nomor', parent: '/dashboard' },
  '/letters': { label: 'Riwayat Surat', title: 'Riwayat Surat' },
  '/gap-requests': { label: 'Gap Request', title: 'Gap Request' },
  '/admin/dashboard': { label: 'Dashboard Admin', title: 'Dashboard Admin', section: 'Admin' },
  '/admin/letters': { label: 'Semua Surat', title: 'Semua Surat', section: 'Admin' },
  '/admin/gap-requests': { label: 'Kelola Gap', title: 'Kelola Gap', section: 'Admin' },
  '/admin/sequences': { label: 'Pengaturan Sequence', title: 'Pengaturan Sequence', section: 'Admin' },
  '/admin/users': { label: 'Kelola User', title: 'Kelola User', section: 'Admin' },
  '/admin/classifications': { label: 'Klasifikasi', title: 'Klasifikasi', section: 'Admin' },
  '/admin/audit-logs': { label: 'Audit Log', title: 'Audit Log', section: 'Admin' },
  '/admin/reports': { label: 'Laporan', title: 'Laporan', section: 'Admin' },
};

/**
 * Navbar — Bar navigasi atas.
 * Menampilkan breadcrumb, nama user, divisi, dan tombol logout.
 * Logout: panggil API → clear store → redirect /login.
 * Auto-update document.title berdasarkan halaman aktif.
 */
export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);

  // Update document title berdasarkan route aktif
  useEffect(() => {
    const route = routeMap[location.pathname];
    if (route) {
      document.title = `${route.title} — Sistem Penomoran Surat`;
    } else {
      document.title = 'SIMONS — Sistem Penomoran Surat';
    }
  }, [location.pathname]);

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

  // Build breadcrumb items
  const buildBreadcrumbs = () => {
    const route = routeMap[location.pathname];
    if (!route) return [];

    const crumbs = [];

    // Tambahkan section jika ada (e.g. "Admin")
    if (route.section) {
      crumbs.push({ label: route.section, to: null });
    }

    // Tambahkan parent jika ada
    if (route.parent) {
      const parent = routeMap[route.parent];
      if (parent) {
        crumbs.push({ label: parent.label, to: route.parent });
      }
    }

    // Halaman aktif (tanpa link)
    crumbs.push({ label: route.label, to: null, active: true });

    return crumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20">
      {/* Kiri — Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRightIcon className="h-3.5 w-3.5 text-gray-300 shrink-0" />
            )}
            {crumb.to ? (
              <Link
                to={crumb.to}
                className="text-gray-500 hover:text-indigo-600 transition-colors font-medium"
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                className={`${
                  crumb.active
                    ? 'text-gray-900 font-semibold'
                    : 'text-gray-400 font-medium'
                }`}
              >
                {crumb.label}
              </span>
            )}
          </div>
        ))}
      </nav>

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
