import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import logo from '../../assets/logo.png';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileReady, setTurnstileReady] = useState(!TURNSTILE_SITE_KEY);

  const passwordRef = useRef(null);
  const turnstileContainerRef = useRef(null);
  const turnstileWidgetIdRef = useRef(null);

  // Verifikasi client-side: form valid jika NIP 18 digit, password ada, dan (jika Turnstile aktif) token sudah didapat
  const isFormValid = nip.length === 18 && password.length > 0 && (TURNSTILE_SITE_KEY ? turnstileToken.length > 0 : true);

  const renderTurnstile = useCallback(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileContainerRef.current) return;
    if (!window.turnstile) return;

    // Jika sudah pernah di-render, reset saja
    if (turnstileWidgetIdRef.current !== null) {
      window.turnstile.reset(turnstileWidgetIdRef.current);
      return;
    }

    turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: 'light',
      callback: (token) => {
        setTurnstileToken(token);
        setTurnstileReady(true);
      },
      'expired-callback': () => {
        setTurnstileToken('');
        setTurnstileReady(false);
      },
      'error-callback': () => {
        setTurnstileToken('');
        setTurnstileReady(false);
        setError('Verifikasi keamanan (Turnstile) gagal dimuat. Silakan refresh halaman.');
      },
    });
  }, []);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;

    // Tunggu script Turnstile selesai dimuat
    if (window.turnstile) {
      renderTurnstile();
      return;
    }

    const interval = setInterval(() => {
      if (window.turnstile) {
        clearInterval(interval);
        renderTurnstile();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [renderTurnstile]);

  const resetTurnstile = useCallback(() => {
    if (!TURNSTILE_SITE_KEY || turnstileWidgetIdRef.current === null) return;
    window.turnstile?.reset(turnstileWidgetIdRef.current);
    setTurnstileToken('');
    setTurnstileReady(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (nip.length !== 18) {
      setError('NIP harus berjumlah 18 angka.');
      return;
    }
    if (!password) {
      setError('Password tidak boleh kosong.');
      return;
    }
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError('Verifikasi keamanan (Turnstile) belum selesai. Mohon tunggu.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(nip, password, turnstileToken || null);
      const { user, token } = result.data;

      setAuth(user, token);

      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      // Reset widget Turnstile otomatis agar user bisa mencoba kembali
      resetTurnstile();

      const status = err.response?.status;
      if (status === 422 && err.response?.data?.errors?.cf_turnstile_response) {
        setError(err.response.data.errors.cf_turnstile_response[0]);
      } else if (status === 401) {
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
                onChange={(e) => setNip(e.target.value.replace(/\D/g, '').slice(0, 18))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && nip.trim()) {
                    e.preventDefault();
                    passwordRef.current?.focus();
                  }
                }}
                placeholder="Masukkan NIP"
                maxLength="18"
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

            {/* Cloudflare Turnstile Widget */}
            {TURNSTILE_SITE_KEY && (
              <div className="flex justify-center">
                <div ref={turnstileContainerRef} id="cf-turnstile-login" />
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={!isFormValid || loading}
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

