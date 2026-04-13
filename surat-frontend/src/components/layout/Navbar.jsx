import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { logout as logoutApi } from '../../api/auth.api';
import {
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  Bars3Icon,
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
export default function Navbar({ onToggleSidebar, sidebarCollapsed }) {
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
    <header
      className={`
        fixed top-0 right-0 h-[52px] bg-white border-b border-[#E2E8F0]
        flex items-center justify-between px-4 md:px-6 z-20
        transition-all duration-300
        left-0
        ${sidebarCollapsed ? 'lg:left-[68px]' : 'lg:left-[220px]'}
      `}
    >
      {/* Kiri — Hamburger + Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Hamburger for mobile */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:bg-[#F7F9FC] hover:text-[#0B1F3A] transition-colors"
          aria-label="Toggle menu"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRightIcon className="h-3.5 w-3.5 text-[#94A3B8] shrink-0" />
              )}
              {crumb.to ? (
                <Link
                  to={crumb.to}
                  className="text-[#64748B] hover:text-[#2A7FD4] transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={`${
                    crumb.active
                      ? 'text-[#0B1F3A] font-medium'
                      : 'text-[#94A3B8]'
                  }`}
                >
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Kanan — Status + nama user + tombol keluar */}
      <div className="flex items-center gap-3">
        {/* Avatar + nama — klik navigasi ke /profile */}
        <Link
          to="/profile"
          className="hidden sm:flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          {user?.profile_photo ? (
            <img
              src={user.profile_photo}
              alt="Foto Profil"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#0B1F3A] flex items-center justify-center text-white text-sm font-semibold">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm text-[#0B1F3A] font-medium">
            {user?.name || 'User'}
          </span>
        </Link>

        {/* Tombol Logout — border tipis, compact */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#64748B] border border-[#E2E8F0] rounded-lg hover:bg-[#FEF2F2] hover:text-[#991B1B] hover:border-[#FECACA] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Keluar"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{loggingOut ? 'Keluar...' : 'Keluar'}</span>
        </button>
      </div>
    </header>
  );
}
