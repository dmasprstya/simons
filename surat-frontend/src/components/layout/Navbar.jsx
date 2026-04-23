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
  '/profile': { label: 'Profil Saya', title: 'Profil Saya' },
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
 * Navbar — Bar navigasi atas (VCEP-2026 redesign).
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
  const divisionLabel =
    typeof user?.work_unit === 'string'
      ? user.work_unit
      : user?.work_unit?.title || user?.work_unit?.name || null;

  return (
    <header
      className={`
        fixed top-0 right-0 h-[64px] bg-white/80 backdrop-blur-md
        border-b border-slate-100 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]
        flex items-center justify-between px-4 md:px-8 z-20
        transition-all duration-300
        left-0
        ${sidebarCollapsed ? 'lg:left-[68px]' : 'lg:left-[260px]'}
      `}
    >
      {/* ── Kiri — Hamburger + Breadcrumb ── */}
      <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
        {/* Hamburger for mobile */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-navy transition-colors shrink-0"
          aria-label="Toggle menu"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        {/* Breadcrumb */}
        <nav 
          className="flex items-center gap-1.5 text-[13px] md:text-sm overflow-x-auto no-scrollbar whitespace-nowrap py-1" 
          aria-label="Breadcrumb"
        >
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-1.5 shrink-0">
              {index > 0 && (
                <ChevronRightIcon className="h-3.5 w-3.5 text-slate-300 shrink-0" />
              )}
              {crumb.to ? (
                <Link
                  to={crumb.to}
                  className="text-slate-400 hover:text-primary font-medium transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={
                    crumb.active
                      ? 'text-navy font-bold'
                      : 'text-slate-400 font-medium'
                  }
                >
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* ── Kanan — Avatar + nama + tombol logout ── */}
      <div className="flex items-center gap-3">
        {/* Avatar + info — klik navigasi ke /profile */}
        <Link
          to="/profile"
          className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors group"
        >
          {/* Avatar */}
          {user?.photo_url || user?.profile_photo ? (
            <img
              src={user.photo_url || user?.profile_photo}
              alt="Foto Profil"
              className="w-8 h-8 rounded-xl object-cover border border-slate-100 shadow-sm"
            />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary/20">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
          )}

          {/* Nama & divisi */}
          <div className="text-left">
            <p className="text-sm font-bold text-navy leading-tight group-hover:text-primary transition-colors">
              {user?.name || 'User'}
            </p>
            {divisionLabel && (
              <p className="text-[11px] text-muted leading-tight">{divisionLabel}</p>
            )}
          </div>
        </Link>

        {/* Divider */}
        <div className="hidden sm:block h-6 w-px bg-slate-100" />

        {/* Tombol Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-500 rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Keluar"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{loggingOut ? 'Keluar...' : 'Keluar'}</span>
        </button>
      </div>
    </header>
  );
}
