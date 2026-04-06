import { useState, useEffect } from 'react';
import { displayLetterNumber } from '../../utils/formatNumber';
import { useNavigate } from 'react-router-dom';
import { takeNumber } from '../../api/letters.api';
import { useToast } from '../../hooks/useToast';
import ClassificationPicker from '../../components/ui/ClassificationPicker';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ErrorMessage from '../../components/ui/ErrorMessage';
import FormErrors from '../../components/ui/FormErrors';

/**
 * TakeNumberPage — Halaman untuk mengambil nomor surat baru.
 *
 * Form:
 * - ClassificationPicker (wajib, hanya is_leaf=true)
 * - Input "Perihal" (subject) — wajib, max 255
 * - Input "Tujuan" (destination) — wajib, max 255
 *
 * Submit: POST /letters → tampilkan modal hasil dengan nomor yang diterbitkan
 * Error 409: "Sistem sedang sibuk, coba lagi dalam beberapa detik"
 */
export default function TakeNumberPage() {
  const navigate = useNavigate();
  const toast = useToast();

  // Update document title
  useEffect(() => {
    document.title = 'Ambil Nomor — Sistem Penomoran Surat';
    return () => { document.title = 'SIMONS — Sistem Penomoran Surat'; };
  }, []);

  // Form state
  const [classificationId, setClassificationId] = useState(null);
  const [subject, setSubject] = useState('');
  const [destination, setDestination] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [serverErrors, setServerErrors] = useState(null);

  // Modal result state
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);

  // Validasi form sebelum submit
  const validate = () => {
    const errors = {};

    if (!classificationId) {
      errors.classification = 'Klasifikasi wajib dipilih (sampai Level 3).';
    }
    if (!subject.trim()) {
      errors.subject = 'Perihal wajib diisi.';
    } else if (subject.trim().length > 255) {
      errors.subject = 'Perihal maksimal 255 karakter.';
    }
    if (!destination.trim()) {
      errors.destination = 'Tujuan wajib diisi.';
    } else if (destination.trim().length > 255) {
      errors.destination = 'Tujuan maksimal 255 karakter.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setError(null);
    setServerErrors(null);

    try {
      const response = await takeNumber({
        classification_id: classificationId,
        subject: subject.trim(),
        destination: destination.trim(),
      });

      // Sukses — tampilkan modal hasil + toast
      setResultData(response.data);
      setShowResult(true);
      toast.success('Nomor surat berhasil diambil!');
    } catch (err) {
      // Error 422 — validasi dari backend
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setServerErrors(err.response.data.errors);
      }
      // Error 409 — lock timeout / deadlock
      else if (err.response?.status === 409) {
        setError('Sistem sedang sibuk, coba lagi dalam beberapa detik.');
      } else {
        const message =
          err.response?.data?.message || 'Gagal mengambil nomor surat. Silakan coba lagi.';
        setError(message);
      }
      toast.error('Gagal mengambil nomor surat.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form untuk ambil nomor lagi
  const resetForm = () => {
    setClassificationId(null);
    setSubject('');
    setDestination('');
    setError(null);
    setValidationErrors({});
    setServerErrors(null);
    setShowResult(false);
    setResultData(null);
  };

  const inputBaseClass = `
    block w-full rounded-lg border px-3 py-2 text-sm text-gray-900
    shadow-sm transition-colors
    focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
  `;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🔢 Ambil Nomor Surat</h1>
        <p className="mt-1 text-sm text-gray-500">
          Isi formulir di bawah untuk mengambil nomor surat baru.
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ClassificationPicker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Klasifikasi Surat <span className="text-red-500">*</span>
            </label>
            <ClassificationPicker
              value={classificationId}
              onChange={setClassificationId}
              disabled={loading}
            />
            {validationErrors.classification && (
              <p className="mt-1 text-xs text-red-600">
                {validationErrors.classification}
              </p>
            )}
          </div>

          {/* Subject / Perihal */}
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Perihal <span className="text-red-500">*</span>
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
              maxLength={255}
              placeholder="Contoh: Undangan Rapat Koordinasi"
              className={`${inputBaseClass} ${
                validationErrors.subject
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300'
              }`}
            />
            <div className="flex items-center justify-between mt-1">
              {validationErrors.subject ? (
                <p className="text-xs text-red-600">{validationErrors.subject}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-gray-400">
                {subject.length}/255
              </span>
            </div>
          </div>

          {/* Destination / Tujuan */}
          <div>
            <label
              htmlFor="destination"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tujuan <span className="text-red-500">*</span>
            </label>
            <input
              id="destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              disabled={loading}
              maxLength={255}
              placeholder="Contoh: Kepala Dinas Pendidikan"
              className={`${inputBaseClass} ${
                validationErrors.destination
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300'
              }`}
            />
            <div className="flex items-center justify-between mt-1">
              {validationErrors.destination ? (
                <p className="text-xs text-red-600">{validationErrors.destination}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-gray-400">
                {destination.length}/255
              </span>
            </div>
          </div>

          {/* Server validation errors (422) */}
          {serverErrors && <FormErrors errors={serverErrors} />}

          {/* Error message */}
          {error && <ErrorMessage error={error} />}

          {/* Submit button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
          >
            Ambil Nomor
          </Button>
        </form>
      </div>

      {/* Modal hasil */}
      <Modal
        isOpen={showResult}
        onClose={() => setShowResult(false)}
        title="✅ Nomor Surat Berhasil Diambil"
        size="md"
      >
        {resultData && (
          <div className="space-y-4">
            {/* Detail nomor surat terformat (W7-{kode}-{nomor}) */}
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <p className="text-xs text-indigo-600 font-medium uppercase tracking-wide">
                Nomor Surat
              </p>
              <p className="text-2xl font-bold text-indigo-900 mt-1 font-mono tracking-wide">
                {displayLetterNumber(resultData)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 font-medium">Tanggal</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {resultData.issued_date}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 font-medium">Klasifikasi</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">
                  {resultData.classification?.full_code || resultData.classification?.code || '-'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                <p className="text-xs text-gray-500 font-medium">Perihal</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {resultData.subject}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                <p className="text-xs text-gray-500 font-medium">Tujuan</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {resultData.destination}
                </p>
              </div>
            </div>

            {/* Tombol aksi */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={resetForm}
              >
                Ambil Nomor Lagi
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={() => navigate('/letters')}
              >
                Lihat Riwayat
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
