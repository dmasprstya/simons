import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef(null);

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
    <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-[#2A7FD4] text-white font-bold text-xl shadow-lg shadow-[#2A7FD4]/20 mb-4">
            S
          </div>
          <h1 className="text-xl font-bold text-[#0B1F3A]">SIMONS</h1>
          <p className="text-sm text-[#64748B] mt-1">Sistem Informasi Manajemen Penomoran Surat</p>
        </div>

        {/* Card Login */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-8">
          <h2 className="text-base font-semibold text-[#0B1F3A] mb-1">Masuk ke akun Anda</h2>
          <p className="text-sm text-[#64748B] mb-6">Masukkan email dan password untuk melanjutkan.</p>

          {/* Error Message */}
          <ErrorMessage error={error} />
          {error && <div className="mb-4" />}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1.5">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && email.trim()) {
                    e.preventDefault();
                    passwordRef.current?.focus();
                  }
                }}
                placeholder="nama@contoh.com"
                disabled={loading}
                autoComplete="email"
                className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#F7F9FC] text-sm text-[#0B1F3A] placeholder-[#94A3B8]
                  focus:outline-none focus:ring-1 focus:ring-[#2A7FD4]/20 focus:border-[#2A7FD4] focus:bg-white
                  disabled:bg-[#F7F9FC] disabled:cursor-not-allowed
                  transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-[#E2E8F0] bg-[#F7F9FC] text-sm text-[#0B1F3A] placeholder-[#94A3B8]
                    focus:outline-none focus:ring-1 focus:ring-[#2A7FD4]/20 focus:border-[#2A7FD4] focus:bg-white
                    disabled:bg-[#F7F9FC] disabled:cursor-not-allowed
                    transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors"
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
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
        <p className="text-center text-[10px] text-[#94A3B8] mt-6">
          &copy; {new Date().getFullYear()} SIMONS — Sistem Penomoran Surat
        </p>
      </div>
    </div>
  );
}
