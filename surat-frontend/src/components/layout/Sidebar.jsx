import { useState } from 'react';
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
  ChevronDownIcon,
  QueueListIcon,
} from '@heroicons/react/24/outline';
import logo from '../../assets/logo.png';

/**
 * Sidebar — Navigasi utama di sisi kiri.
 * Menampilkan menu sesuai role user dari authStore.
 *
 * User menu: Dashboard, Ambil Nomor, Riwayat Surat, Request Gap
 * Admin menu: semua menu user + divider + Semua Surat, Kelola Gap,
 *             Pengaturan Sequence, Kelola User, Klasifikasi, Audit Log, Laporan
 */

const userOnlyMenuItems = [
  { to: '/letters/take', label: 'Ambil Nomor', icon: HashtagIcon },
  { to: '/letters', label: 'Riwayat Surat', icon: DocumentTextIcon },
  { to: '/gap-requests', label: 'Request Gap', icon: DocumentArrowUpIcon },
];

const adminGroups = [
  {
    title: 'Administrasi',
    items: [
      { to: '/admin/letters', label: 'Semua Surat', icon: DocumentDuplicateIcon },
      { to: '/admin/gap-requests', label: 'Kelola Gap', icon: ShieldCheckIcon },
    ],
  },
  {
    title: 'Pengaturan',
    items: [
      { to: '/admin/sequences', label: 'Pengaturan Sequence', icon: AdjustmentsHorizontalIcon },
      { to: '/admin/classifications', label: 'Klasifikasi', icon: TagIcon },
    ],
  },
  {
    title: 'User & Akses',
    items: [
      { to: '/admin/users', label: 'Kelola User', icon: UsersIcon },
      { to: '/admin/audit-logs', label: 'Audit Log', icon: ClipboardDocumentListIcon },
    ],
  },
  {
    title: 'Laporan',
    items: [
      { to: '/admin/reports', label: 'Laporan', icon: ChartBarIcon },
    ],
  },
];

function SidebarLink({ to, label, icon: Icon, collapsed }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group
        ${isActive
          ? 'bg-primary text-white font-medium shadow-md shadow-primary/20'
          : 'text-slate-500 hover:bg-primary-light hover:text-primary'
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
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  const divisionLabel =
    typeof user?.work_unit === 'string'
      ? user.work_unit
      : user?.work_unit?.title || user?.work_unit?.name || '-';

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
          fixed left-0 top-0 bottom-0 bg-white border-r border-slate-100 flex flex-col z-50
          transition-all duration-300 ease-in-out
          ${collapsed ? 'lg:w-[68px]' : 'lg:w-[260px]'}
          ${isOpen ? 'w-[260px] translate-x-0' : 'w-[260px] -translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo / Branding */}
        <div className={`flex items-center gap-3 px-6 py-6 pb-8 ${collapsed ? 'lg:justify-center lg:px-2' : ''}`}>
          <div className="flex items-center justify-center h-12 w-12 rounded-xl overflow-hidden shadow-sm shrink-0 border border-slate-100/50">
            <img src={logo} alt="Logo SIMONS" className="h-full w-full object-cover" />
          </div>
          {!collapsed && (
            <div className="lg:block">
              <h1 className="text-xl font-extrabold text-primary tracking-tight leading-tight">SIMONS</h1>
              <p className="text-[11px] font-bold text-secondary uppercase tracking-wider">Management System</p>
            </div>
          )}
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 overflow-y-auto sidebar-scroll px-4 pb-4 space-y-1.5 font-plus-jakarta">
          {/* Menu User */}
          {!collapsed && (
            <p className="px-3 mt-4 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">
              Menu Utama
            </p>
          )}
          {/* Menu Dashboard Dinamis sesuai Role */}
          <SidebarLink
            to={isAdmin ? '/admin/dashboard' : '/dashboard'}
            label="Dashboard"
            icon={HomeIcon}
            collapsed={collapsed}
          />

          {/* Menu khusus user biasa — disembunyikan dari admin */}
          {!isAdmin && userOnlyMenuItems.map((item) => (
            <SidebarLink key={item.to} {...item} collapsed={collapsed} />
          ))}

          {/* Menu Admin — tampilkan hanya jika role admin */}
          {isAdmin && (
            <>
              <div className="my-6 border-t border-slate-100 mx-2" />

              <button
                type="button"
                onClick={() => setIsAdminOpen(!isAdminOpen)}
                className={`flex items-center gap-3 w-full px-3 mb-2 transition-all duration-200 group
                  ${collapsed ? 'justify-center' : ''}`}
              >
                <QueueListIcon className={`h-5 w-5 shrink-0 ${isAdminOpen ? 'text-primary' : 'text-slate-400'}`} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] group-hover:text-primary">
                      Administrasi
                    </span>
                    <ChevronDownIcon
                      className={`h-3.5 w-3.5 text-slate-300 transition-transform duration-200 ${isAdminOpen ? 'rotate-180 text-primary' : ''}`}
                    />
                  </>
                )}
              </button>

              {isAdminOpen && (
                <div className={`space-y-4 ${collapsed ? '' : 'pl-2 mt-2'}`}>
                  {adminGroups.map((group) => (
                    <div key={group.title} className="space-y-1">
                      {!collapsed && (
                        <p className="px-3 text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1 shadow-sm">
                          {group.title}
                        </p>
                      )}
                      {group.items.map((item) => (
                        <SidebarLink key={item.to} {...item} collapsed={collapsed} />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </nav>

        {/* Divider sebelum profil */}
        <div className={`px-4 py-6 border-t border-slate-100 ${collapsed ? 'lg:flex lg:flex-col lg:items-center' : ''}`}>
          {/* Avatar + info */}
          <div className={`flex items-center gap-3 mb-4 ${collapsed ? 'lg:justify-center' : ''}`}>
            {user?.photo_url || user?.profile_photo ? (
              <img
                src={user.photo_url || user?.profile_photo}
                alt="Foto Profil"
                className="h-10 w-10 rounded-xl object-cover shrink-0 border border-slate-100 shadow-sm"
              />
            ) : (
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary-light text-primary text-sm font-bold shrink-0 border border-primary-light/50">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-bold text-primary truncate">{user?.name || 'User'}</p>
                <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5">
                  {divisionLabel}
                </p>
              </div>
            )}
          </div>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200
              ${isActive
                ? 'bg-primary text-white font-medium shadow-md shadow-primary/20'
                : 'text-slate-500 hover:bg-primary-light hover:text-primary'
              }
              ${collapsed ? 'lg:justify-center' : ''}`
            }
            title={collapsed ? 'Profil Saya' : undefined}
          >
            <UserCircleIcon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate font-medium">Profil Saya</span>}
          </NavLink>
        </div>
      </aside>
    </>
  );
}
