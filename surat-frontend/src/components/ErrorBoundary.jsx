import { Component } from 'react';

/**
 * ErrorBoundary — menangkap runtime error yang tidak terduga di seluruh
 * komponen tree. Menampilkan halaman error ramah pengguna agar aplikasi
 * tidak crash sepenuhnya (white-screen).
 *
 * Penggunaan: bungkus <App /> di main.jsx dengan <ErrorBoundary>.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Di production, kirim ke monitoring (Sentry, dsb) jika ada.
    // Saat ini hanya dicatat secara internal.
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] px-4">
          <div className="max-w-md w-full text-center">
            {/* Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#FEF2F2] mb-6">
              <svg
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>

            <h1 className="text-lg font-semibold text-[#0B1F3A] mb-2">
              Terjadi Kesalahan
            </h1>
            <p className="text-sm text-[#64748B] mb-6">
              Maaf, terjadi kesalahan yang tidak terduga. Silakan coba muat
              ulang halaman atau kembali ke dashboard.
            </p>

            {/* Detail error (hanya di development) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-3 bg-[#FEF2F2] border border-red-200 rounded-lg text-left">
                <p className="text-xs font-mono text-[#991B1B] break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-5 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#64748B] bg-white hover:bg-[#F7F9FC] transition-colors"
              >
                Muat Ulang Halaman
              </button>
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#0B1F3A] hover:bg-[#1A3558] transition-colors"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
