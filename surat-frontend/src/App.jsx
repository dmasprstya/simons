import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useToast } from './hooks/useToast';

// Guards
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Layout
import { UserLayout } from './components/layout';

// UI
import ToastContainer from './components/ui/Toast';

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

// Profile
import Profile from './pages/Profile';

// 404
import NotFoundPage from './pages/NotFoundPage';

// 403
import UnauthorizedPage from './pages/UnauthorizedPage';

/**
 * Komponen root redirect — arahkan ke dashboard jika sudah login,
 * atau ke login jika belum.
 */
function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
}

/**
 * App — setup routing utama aplikasi SIMONS.
 *
 * Struktur:
 * - / → redirect otomatis berdasarkan status auth
 * - /login → public
 * - /dashboard, /letters/*, /gap-requests → protected (semua role) + UserLayout
 * - /admin/* → protected + hanya role admin + UserLayout
 *
 * ToastContainer di-render secara global agar toast muncul di semua halaman.
 */
function App() {
  const toasts = useToast((state) => state.toasts);
  const dismiss = useToast((state) => state.dismiss);

  return (
    <BrowserRouter>
      {/* Global Toast Container — posisi kanan bawah */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes — membutuhkan autentikasi, dibungkus UserLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<UserLayout />}>
            {/* Route yang bisa diakses semua role */}
            <Route path="/profile" element={<Profile />} />

            {/* Route khusus user biasa — admin tidak boleh mengakses */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/letters/take" element={<TakeNumberPage />} />
              <Route path="/letters" element={<MyLettersPage />} />
              <Route path="/gap-requests" element={<GapRequestPage />} />
            </Route>

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
        </Route>

        {/* Halaman unauthorized — role tidak diizinkan */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Catch-all — halaman 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
