import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

function UnauthorizedPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <span className="text-8xl font-extrabold text-[#0B1F3A]">
            403
          </span>
        </div>

        <h1 className="text-xl font-semibold text-[#0B1F3A] mb-2">
          Akses Ditolak
        </h1>
        <p className="text-sm text-[#64748B] mb-8">
          Anda tidak memiliki izin untuk mengakses halaman ini.
          Halaman ini hanya tersedia untuk role tertentu.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-5 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#64748B] bg-white hover:bg-[#F7F9FC] hover:text-[#0B1F3A] transition-colors"
          >
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            Kembali
          </button>
          <Link
            to={isAdmin ? '/admin/dashboard' : '/dashboard'}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#0B1F3A] hover:bg-[#1A3558] transition-colors"
          >
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
