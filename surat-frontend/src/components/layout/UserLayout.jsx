import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

/**
 * UserLayout — Wrapper layout utama untuk halaman user dan admin.
 * Struktur: Sidebar kiri (fixed 256px) + Navbar atas (fixed 64px) + konten.
 */
export default function UserLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar — fixed di kiri */}
      <Sidebar />

      {/* Navbar — fixed di atas, offset kiri 256px */}
      <Navbar />

      {/* Konten utama — diberikan margin agar tidak tertutup */}
      <main className="ml-64 pt-16">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
