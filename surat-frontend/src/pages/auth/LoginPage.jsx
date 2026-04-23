import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import logo from '../../assets/logo.png';

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

  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef(null);

  // Validasi client-side sederhana
  const isFormValid = nip.trim().length > 0 && password.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Cek validasi sebelum kirim
    if (!nip.trim()) {
      setError('NIP tidak boleh kosong.');
      return;
    }
    if (!password) {
      setError('Password tidak boleh kosong.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(nip, password);
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
        setError('NIP atau password salah.');
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
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-xl overflow-hidden shadow-lg mb-4 border border-slate-200/50">
            <img src={logo} alt="Logo SIMONS" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">SIMONS</h1>
          <p className="text-sm text-slate-500 mt-1">Sistem Informasi Manajemen Penomoran Surat</p>
        </div>

        {/* Card Login */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 sm:p-8">
          <h2 className="text-base font-semibold text-primary mb-1">Masuk ke akun Anda</h2>
          <p className="text-sm text-slate-500 mb-6">Masukkan NIP dan password untuk melanjutkan.</p>

          {/* Error Message */}
          <ErrorMessage error={error} />
          {error && <div className="mb-4" />}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* NIP */}
            <div>
              <label htmlFor="login-nip" className="block text-xs font-medium uppercase tracking-wide text-primary/80 mb-1.5">
                NIP
              </label>
              <input
                id="login-nip"
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && nip.trim()) {
                    e.preventDefault();
                    passwordRef.current?.focus();
                  }
                }}
                placeholder="Masukkan NIP"
                disabled={loading}
                autoComplete="username"
                className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#F7F9FC] text-sm text-primary placeholder-[#94A3B8]
                  focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary focus:bg-white
                  disabled:bg-[#F7F9FC] disabled:cursor-not-allowed
                  transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-medium uppercase tracking-wide text-primary/80 mb-1.5">
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
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-[#E2E8F0] bg-[#F7F9FC] text-sm text-primary placeholder-[#94A3B8]
                    focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary focus:bg-white
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
