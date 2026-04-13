import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  HomeIcon,
  HashtagIcon,
  DocumentTextIcon,
  DocumentArrowUpIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon,
  UsersIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Sidebar — Navigasi utama di sisi kiri.
 * Menampilkan menu sesuai role user dari authStore.
 *
 * User menu: Dashboard, Ambil Nomor, Riwayat Surat, Request Gap
 * Admin menu: semua menu user + divider + Semua Surat, Kelola Gap,
 *             Pengaturan Sequence, Kelola User, Klasifikasi, Audit Log, Laporan
 */

const userMenuItems = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/letters/take', label: 'Ambil Nomor', icon: HashtagIcon },
  { to: '/letters', label: 'Riwayat Surat', icon: DocumentTextIcon },
  { to: '/gap-requests', label: 'Request Gap', icon: DocumentArrowUpIcon },
];

const adminMenuItems = [
  { to: '/admin/dashboard', label: 'Dashboard Admin', icon: HomeIcon },
  { to: '/admin/letters', label: 'Semua Surat', icon: DocumentDuplicateIcon },
  { to: '/admin/gap-requests', label: 'Kelola Gap', icon: ShieldCheckIcon },
  { to: '/admin/sequences', label: 'Pengaturan Sequence', icon: AdjustmentsHorizontalIcon },
  { to: '/admin/users', label: 'Kelola User', icon: UsersIcon },
  { to: '/admin/classifications', label: 'Klasifikasi', icon: TagIcon },
  { to: '/admin/audit-logs', label: 'Audit Log', icon: ClipboardDocumentListIcon },
  { to: '/admin/reports', label: 'Laporan', icon: ChartBarIcon },
];

function SidebarLink({ to, label, icon: Icon, collapsed }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group
        ${
          isActive
            ? 'bg-[#2A7FD4] text-white font-medium shadow-sm shadow-[#2A7FD4]/30'
            : 'text-white/55 hover:bg-white/10 hover:text-white'
        }
        ${collapsed ? 'justify-center' : ''}`
      }
      title={collapsed ? label : undefined}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

export default function Sidebar({ isOpen, onClose, collapsed = false }) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 bottom-0 bg-[#0B1F3A] flex flex-col z-50
          transition-all duration-300 ease-in-out
          ${collapsed ? 'lg:w-[68px]' : 'lg:w-[220px]'}
          ${isOpen ? 'w-[220px] translate-x-0' : 'w-[220px] -translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo / Branding */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'lg:justify-center lg:px-2' : ''}`}>
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#2A7FD4] text-white font-bold text-sm shrink-0">
            S
          </div>
          {!collapsed && (
            <div className="lg:block">
              <h1 className="text-sm font-bold text-white leading-tight">SIMONS</h1>
              <p className="text-[10px] text-white/40 leading-tight">Penomoran Surat</p>
            </div>
          )}
          {/* Visible only in collapsed state on lg, hide completely */}
          {collapsed && (
            <div className="block lg:hidden">
              <h1 className="text-sm font-bold text-white leading-tight">SIMONS</h1>
              <p className="text-[10px] text-white/40 leading-tight">Penomoran Surat</p>
            </div>
          )}
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4 space-y-1">
          {/* Menu User */}
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
              Menu Utama
            </p>
          )}
          {userMenuItems.map((item) => (
            <SidebarLink key={item.to} {...item} collapsed={collapsed} />
          ))}

          {/* Menu Admin — tampilkan hanya jika role admin */}
          {isAdmin && (
            <>
              <div className="my-3 border-t border-white/10" />
              {!collapsed && (
                <p className="px-3 mb-2 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
                  Administrasi
                </p>
              )}
              {adminMenuItems.map((item) => (
                <SidebarLink key={item.to} {...item} collapsed={collapsed} />
              ))}
            </>
          )}
        </nav>

        {/* Divider sebelum profil */}
        <div className="border-t border-white/10" />

        {/* Profile section — avatar, nama, role badge, link ke /profile */}
        <div className={`px-3 py-3 space-y-2 ${collapsed ? 'lg:flex lg:flex-col lg:items-center' : ''}`}>
          {/* Avatar + info */}
          <div className={`flex items-center gap-2 ${collapsed ? 'lg:justify-center' : ''}`}>
            {/* Avatar: foto profil jika ada, fallback ke inisial */}
            {user?.profile_photo ? (
              <img
                src={user.profile_photo}
                alt="Foto Profil"
                className="h-8 w-8 rounded-full object-cover shrink-0 ring-2 ring-[#2A7FD4]/60"
              />
            ) : (
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#2A7FD4] text-white text-xs font-semibold shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{user?.name || 'User'}</p>
                {/* Role badge */}
                <span className={`inline-block text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded mt-0.5
                  ${user?.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-[#2A7FD4]/20 text-[#2A7FD4]'}`}>
                  {user?.role || 'user'}
                </span>
              </div>
            )}
          </div>

          {/* NavLink ke halaman profil */}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200
              ${
                isActive
                  ? 'bg-[#2A7FD4] text-white font-medium shadow-sm shadow-[#2A7FD4]/30'
                  : 'text-white/55 hover:bg-white/10 hover:text-white'
              }
              ${collapsed ? 'lg:justify-center' : ''}`
            }
            title={collapsed ? 'Profil Saya' : undefined}
          >
            <UserCircleIcon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">Profil Saya</span>}
          </NavLink>
        </div>

        {/* Footer — User info (divisi) */}
        <div className={`px-3 py-3 border-t border-white/10 ${collapsed ? 'lg:flex lg:justify-center' : ''}`}>
          <div className={`flex items-center gap-2 ${collapsed ? 'lg:justify-center' : ''}`}>
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#2A7FD4] text-white text-xs font-semibold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="min-w-0 lg:block">
                <p className="text-xs font-medium text-white truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-white/40 truncate">{user?.division?.name || user?.role || '-'}</p>
              </div>
            )}
            {collapsed && (
              <div className="min-w-0 block lg:hidden">
                <p className="text-xs font-medium text-white truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-white/40 truncate">{user?.division?.name || user?.role || '-'}</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
