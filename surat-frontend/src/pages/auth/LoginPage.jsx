import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';

/**
 * LoginPage — Halaman login dengan form email + password.
 *
 * Flow submit:
 *  1. Validasi client-side: email format, password tidak kosong
 *  2. Panggil login() dari auth.api.js
 *  3. Simpan user + token ke authStore via setAuth()
 *  4. Redirect ke /dashboard (user) atau /admin/dashboard (admin)
 *  5. Tampilkan pesan error jika gagal (401, 403)
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Validasi client-side sederhana
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = isEmailValid && password.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Cek validasi sebelum kirim
    if (!email.trim()) {
      setError('Email tidak boleh kosong.');
      return;
    }
    if (!isEmailValid) {
      setError('Format email tidak valid.');
      return;
    }
    if (!password) {
      setError('Password tidak boleh kosong.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      const { user, token } = result.data;

      // Simpan ke Zustand store
      setAuth(user, token);

      // Redirect berdasarkan role
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      // Tangani error dari backend
      const status = err.response?.status;
      if (status === 401) {
        setError('Email atau password salah.');
      } else if (status === 403) {
        setError('Akun Anda telah dinonaktifkan. Hubungi administrator.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-indigo-600 text-white font-bold text-2xl shadow-lg shadow-indigo-200 mb-4">
            S
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SIMONS</h1>
          <p className="text-sm text-gray-500 mt-1">Sistem Informasi Manajemen Penomoran Surat</p>
        </div>

        {/* Card Login */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Masuk ke akun Anda</h2>
          <p className="text-sm text-gray-500 mb-6">Masukkan email dan password untuk melanjutkan.</p>

          {/* Error Message */}
          <ErrorMessage error={error} />
          {error && <div className="mb-4" />}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@contoh.com"
                disabled={loading}
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                  disabled:bg-gray-50 disabled:cursor-not-allowed
                  transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                disabled={loading}
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                  disabled:bg-gray-50 disabled:cursor-not-allowed
                  transition-all duration-200"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={!isFormValid}
              className="w-full"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} SIMONS — Sistem Penomoran Surat
        </p>
      </div>
    </div>
  );
}
