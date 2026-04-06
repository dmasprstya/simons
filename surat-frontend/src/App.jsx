import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Guards
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Public pages
import LoginPage from './pages/auth/LoginPage';

// User pages
import DashboardPage from './pages/user/DashboardPage';
import TakeNumberPage from './pages/user/TakeNumberPage';
import MyLettersPage from './pages/user/MyLettersPage';
import GapRequestPage from './pages/user/GapRequestPage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AllLettersPage from './pages/admin/AllLettersPage';
import AdminGapRequestPage from './pages/admin/AdminGapRequestPage';
import SequenceSettingsPage from './pages/admin/SequenceSettingsPage';
import UsersPage from './pages/admin/UsersPage';
import ClassificationsPage from './pages/admin/ClassificationsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import ReportsPage from './pages/admin/ReportsPage';

/**
 * Komponen root redirect — arahkan ke dashboard jika sudah login,
 * atau ke login jika belum.
 */
function RootRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

/**
 * App — setup routing utama aplikasi SIMONS.
 *
 * Struktur:
 * - / → redirect otomatis berdasarkan status auth
 * - /login → public
 * - /dashboard, /letters/*, /gap-requests → protected (semua role)
 * - /admin/* → protected + hanya role admin
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes — membutuhkan autentikasi */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/letters/take" element={<TakeNumberPage />} />
          <Route path="/letters" element={<MyLettersPage />} />
          <Route path="/gap-requests" element={<GapRequestPage />} />

          {/* Admin routes — membutuhkan role admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/letters" element={<AllLettersPage />} />
            <Route path="/admin/gap-requests" element={<AdminGapRequestPage />} />
            <Route path="/admin/sequences" element={<SequenceSettingsPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/classifications" element={<ClassificationsPage />} />
            <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
          </Route>
        </Route>

        {/* Catch-all — redirect ke root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
