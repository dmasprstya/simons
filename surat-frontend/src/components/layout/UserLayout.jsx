import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

/**
 * UserLayout — Wrapper layout utama untuk halaman user dan admin.
 * Struktur: Sidebar kiri (fixed 220px / 68px collapsed) + Navbar atas (fixed 52px) + konten.
 *
 * Responsif:
 * - Mobile (< lg): sidebar hidden, toggle via hamburger → drawer overlay
 * - Tablet (md - lg): sidebar collapsible (ikon saja, tanpa label teks)
 * - Desktop (>= lg): sidebar full 220px
 */
export default function UserLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Detect tablet breakpoint for auto-collapse (md to lg)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px) and (max-width: 1023px)');
    const handleChange = (e) => setCollapsed(e.matches);

    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, []);

  const handleToggleSidebar = () => {
    // On mobile: toggle drawer
    setMobileOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-plus-jakarta">
      {/* Sidebar — fixed di kiri */}
      <Sidebar
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
      />

      {/* Navbar — fixed di atas */}
      <Navbar
        onToggleSidebar={handleToggleSidebar}
        sidebarCollapsed={collapsed}
      />

      {/* Konten utama — diberikan margin agar tidak tertutup */}
      <main
        className={`
          pt-[64px] transition-all duration-300
          ml-0
          ${collapsed ? 'lg:ml-[68px]' : 'lg:ml-[260px]'}
        `}
      >
        <div className="p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
