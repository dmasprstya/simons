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

function SidebarLink({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
        ${
          isActive
            ? 'bg-indigo-50 text-indigo-700 shadow-sm'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
    >
      <Icon className="h-5 w-5 shrink-0 transition-colors duration-200" />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 flex flex-col z-30">
      {/* Logo / Branding */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-sm">
          S
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900 leading-tight">SIMONS</h1>
          <p className="text-[11px] text-gray-400 leading-tight">Penomoran Surat</p>
        </div>
      </div>

      {/* Menu Navigasi */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Menu User */}
        <p className="px-3 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Menu Utama
        </p>
        {userMenuItems.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}

        {/* Menu Admin — tampilkan hanya jika role admin */}
        {isAdmin && (
          <>
            <div className="my-4 border-t border-gray-200" />
            <p className="px-3 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Administrasi
            </p>
            {adminMenuItems.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </>
        )}
      </nav>

      {/* Footer — versi */}
      <div className="px-5 py-3 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 text-center">SIMONS v1.0.0</p>
      </div>
    </aside>
  );
}
