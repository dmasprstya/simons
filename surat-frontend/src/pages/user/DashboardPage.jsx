import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useSequenceStore } from '../../store/sequenceStore';
import { getToday } from '../../api/sequences.api';
import { getMyLetters } from '../../api/letters.api';
import ClassificationPicker from '../../components/ui/ClassificationPicker';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import StatusChip from '../../components/ui/StatusChip';

/**
 * DashboardPage — Halaman utama untuk role user.
 *
 * Fitur:
 * - Greeting dengan nama user + tanggal hari ini
 * - Card info sequence hari ini (pilih klasifikasi → fetch sequence)
 * - Tombol "Ambil Nomor Sekarang"
 * - Card riwayat singkat 5 surat terakhir
 */
export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { setSequence } = useSequenceStore();
  const navigate = useNavigate();

  // State untuk sequence hari ini
  const [selectedClassification, setSelectedClassification] = useState(null);
  const [sequenceData, setSequenceData] = useState(null);
  const [sequenceLoading, setSequenceLoading] = useState(false);
  const [sequenceError, setSequenceError] = useState(null);

  // State untuk riwayat singkat
  const [recentLetters, setRecentLetters] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState(null);

  // Format tanggal hari ini dalam bahasa Indonesia
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Fetch sequence hari ini saat klasifikasi dipilih
  const fetchSequence = useCallback(
    async (classificationId) => {
      if (!classificationId) {
        setSequenceData(null);
        return;
      }

      setSequenceLoading(true);
      setSequenceError(null);

      try {
        const response = await getToday(classificationId);
        setSequenceData(response.data);
        // Simpan ke store global
        setSequence(classificationId, response.data);
      } catch (err) {
        const message =
          err.response?.data?.message || 'Gagal memuat data sequence. Silakan coba lagi.';
        setSequenceError(message);
        setSequenceData(null);
      } finally {
        setSequenceLoading(false);
      }
    },
    [setSequence]
  );

  // Handler saat pilih klasifikasi
  const handleClassificationChange = (classificationId) => {
    setSelectedClassification(classificationId);
    if (classificationId) {
      fetchSequence(classificationId);
    } else {
      setSequenceData(null);
      setSequenceError(null);
    }
  };

  // Fetch 5 surat terakhir milik user
  useEffect(() => {
    let cancelled = false;

    const fetchRecent = async () => {
      setRecentLoading(true);
      setRecentError(null);

      try {
        const response = await getMyLetters({ per_page: 5 });
        if (!cancelled) {
          setRecentLetters(response.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err.response?.data?.message || 'Gagal memuat riwayat surat.';
          setRecentError(message);
        }
      } finally {
        if (!cancelled) setRecentLoading(false);
      }
    };

    fetchRecent();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">
          Selamat datang, {user?.name || 'User'} 👋
        </h1>
        <p className="mt-1 text-indigo-100 text-sm">{today}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card info sequence hari ini */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              📊 Info Sequence Hari Ini
            </h2>
          </div>

          {/* ClassificationPicker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Klasifikasi
            </label>
            <ClassificationPicker
              value={selectedClassification}
              onChange={handleClassificationChange}
            />
          </div>

          {/* Loading skeleton */}
          {sequenceLoading && (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          )}

          {/* Error state */}
          {sequenceError && <ErrorMessage error={sequenceError} />}

          {/* Data sequence */}
          {sequenceData && !sequenceLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <p className="text-xs text-indigo-600 font-medium uppercase tracking-wide">
                  Nomor Terakhir
                </p>
                <p className="text-2xl font-bold text-indigo-900 mt-1">
                  {sequenceData.last_number ?? '-'}
                </p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">
                  Zona Aktif
                </p>
                <p className="text-sm font-semibold text-emerald-900 mt-1">
                  {sequenceData.active_start ?? '-'} – {sequenceData.active_end ?? '-'}
                </p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 text-center">
                <p className="text-xs text-amber-600 font-medium uppercase tracking-wide">
                  Zona Gap
                </p>
                <p className="text-sm font-semibold text-amber-900 mt-1">
                  {sequenceData.gap_start ?? '-'} – {sequenceData.gap_end ?? '-'}
                </p>
              </div>
            </div>
          )}

          {/* Placeholder jika belum pilih klasifikasi */}
          {!selectedClassification && !sequenceLoading && (
            <p className="text-sm text-gray-400 text-center py-4">
              Pilih klasifikasi di atas untuk melihat info sequence hari ini.
            </p>
          )}

          {/* Tombol Ambil Nomor */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/letters/take')}
            >
              🔢 Ambil Nomor Sekarang
            </Button>
          </div>
        </div>

        {/* Card riwayat singkat */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              📝 Riwayat Surat Terbaru
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/letters')}
            >
              Lihat Semua →
            </Button>
          </div>

          {/* Loading skeleton */}
          {recentLoading && (
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-20" />
                  <div className="h-4 bg-gray-200 rounded flex-1" />
                  <div className="h-5 bg-gray-200 rounded w-16" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {recentError && <ErrorMessage error={recentError} />}

          {/* Daftar surat terbaru */}
          {!recentLoading && !recentError && recentLetters.length > 0 && (
            <div className="divide-y divide-gray-100">
              {recentLetters.map((letter) => (
                <div
                  key={letter.id}
                  className="flex items-center justify-between py-3 gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {letter.full_number || letter.letter_number}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {letter.subject}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-400">
                      {letter.issued_date}
                    </span>
                    <StatusChip status={letter.status} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!recentLoading && !recentError && recentLetters.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">
                Belum ada surat yang diambil.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-3"
                onClick={() => navigate('/letters/take')}
              >
                Ambil Nomor Pertama
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
