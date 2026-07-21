import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { logout as logoutApi } from '../../api/auth.api';
import { getAllRequests } from '../../api/gapRequests.api';
import {
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  Bars3Icon,
  BellIcon,
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
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const isAdmin = user?.role === 'admin';

  const fetchNotifications = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await getAllRequests({ status: 'pending', per_page: 5 });
      setNotifications(res.data || []);
    } catch (err) {
      // Silent error for background updates
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 3000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, fetchNotifications]);

  useEffect(() => {
    if (!showNotifications) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('#notification-bell-container')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [showNotifications]);

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
        {/* Notification Bell (Admin Only) */}
        {isAdmin && (
          <div id="notification-bell-container" className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex items-center justify-center w-8 h-8 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-primary transition-colors shrink-0"
              title="Notifikasi"
            >
              <BellIcon className="h-6 w-6" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                  {notifications.length > 99 ? '99+' : notifications.length}
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl py-2 z-30 transition-all duration-200">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-navy uppercase tracking-wider">Gap Requests</h3>
                  {notifications.length > 0 && (
                    <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {notifications.length} Pending
                    </span>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-slate-400">
                      Tidak ada permintaan gap pending
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/admin/gap-requests');
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0"
                      >
                        <div className="flex justify-between items-start mb-0.5">
                          <p className="text-xs font-bold text-navy">{notif.requested_by?.name || 'User'}</p>
                          <span className="text-[10px] text-primary font-bold bg-primary-light px-1.5 py-0.5 rounded">
                            {notif.classification?.code || '-'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mb-1">{notif.subject || '-'}</p>
                        <p className="text-[9px] text-slate-400">
                          {notif.created_at ? new Date(notif.created_at).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          }) : '-'}
                        </p>
                      </button>
                    ))
                  )}
                </div>
                <div className="px-4 pt-2 pb-1 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/admin/gap-requests');
                    }}
                    className="text-[11px] font-bold text-primary hover:text-primary-dark transition-colors inline-block"
                  >
                    Lihat Semua Request
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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
