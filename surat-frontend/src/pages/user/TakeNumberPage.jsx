import { useState, useEffect } from 'react';
import { displayLetterNumber, displayClassification } from '../../utils/formatNumber';
import { useNavigate } from 'react-router-dom';
import { takeNumber } from '../../api/letters.api';
import { useToast } from '../../hooks/useToast';
import ClassificationPicker from '../../components/ui/ClassificationPicker';
import Card from '../../components/ui/Card';
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
  const [sifatSurat, setSifatSurat] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [serverErrors, setServerErrors] = useState(null);

  // Modal result state
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);

  // Opsi dropdown Sifat Surat — nilai enum sesuai backend
  const SIFAT_SURAT_OPTIONS = [
    { value: 'sangat_segera', label: 'Sangat Segera' },
    { value: 'segera',        label: 'Segera' },
    { value: 'biasa',         label: 'Biasa' },
    { value: 'rahasia',       label: 'Rahasia' },
  ];

  // Validasi form sebelum submit
  const validate = () => {
    const errors = {};

    if (!classificationId) {
      errors.classification = 'Klasifikasi wajib dipilih.';
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
    if (!sifatSurat) {
      errors.sifat_surat = 'Sifat surat wajib dipilih.';
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
        sifat_surat: sifatSurat,
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
    setSifatSurat('');
    setError(null);
    setValidationErrors({});
    setServerErrors(null);
    setShowResult(false);
    setResultData(null);
  };

  const inputBaseClass = `
    block w-full h-9 rounded-lg border bg-[#F7F9FC] px-3 text-sm text-[#0B1F3A]
    transition-all duration-200
    focus:border-[#2A7FD4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2A7FD4]/20
    disabled:bg-[#F7F9FC] disabled:text-[#94A3B8] disabled:cursor-not-allowed
  `;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-navy">Ambil Nomor Surat</h1>
        <p className="mt-1 text-sm text-muted">
          Isi formulir di bawah untuk mengambil nomor surat baru.
        </p>
      </div>

      {/* Form card */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ClassificationPicker */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-2">
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
              className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1"
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
                  : 'border-[#E2E8F0]'
              }`}
            />
            <div className="flex items-center justify-between mt-1">
              {validationErrors.subject ? (
                <p className="text-xs text-red-600">{validationErrors.subject}</p>
              ) : (
                <span />
              )}
              <span className="text-[10px] text-[#94A3B8]">
                {subject.length}/255
              </span>
            </div>
          </div>

          {/* Destination / Tujuan */}
          <div>
            <label
              htmlFor="destination"
              className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1"
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
                  : 'border-[#E2E8F0]'
              }`}
            />
            <div className="flex items-center justify-between mt-1">
              {validationErrors.destination ? (
                <p className="text-xs text-red-600">{validationErrors.destination}</p>
              ) : (
                <span />
              )}
              <span className="text-[10px] text-[#94A3B8]">
                {destination.length}/255
              </span>
            </div>
          </div>

          {/* Sifat Surat */}
          <div>
            <label
              htmlFor="sifat_surat"
              className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1"
            >
              Sifat Surat <span className="text-red-500">*</span>
            </label>
            <select
              id="sifat_surat"
              value={sifatSurat}
              onChange={(e) => setSifatSurat(e.target.value)}
              disabled={loading}
              className={`block w-full h-9 rounded-lg border bg-[#F7F9FC] px-3 text-sm text-[#0B1F3A]
                transition-all duration-200
                focus:border-[#2A7FD4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2A7FD4]/20
                disabled:bg-[#F7F9FC] disabled:text-[#94A3B8] disabled:cursor-not-allowed
                ${
                  validationErrors.sifat_surat
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-[#E2E8F0]'
                }`}
            >
              <option value="">— Pilih Sifat Surat —</option>
              {SIFAT_SURAT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {validationErrors.sifat_surat && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.sifat_surat}</p>
            )}
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
      </Card>

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
            <div className="bg-blue-50 rounded-2xl p-5 text-center">
              <p className="text-xs text-blue-500 font-bold uppercase tracking-widest">
                Nomor Surat
              </p>
              <p className="text-3xl font-bold text-navy mt-2 font-mono tracking-wide">
                {displayLetterNumber(resultData)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] text-muted font-semibold uppercase tracking-widest">Tanggal</p>
                <p className="text-sm font-bold text-navy mt-0.5">{resultData.issued_date}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] text-muted font-semibold uppercase tracking-widest">Klasifikasi</p>
                <p className="text-sm font-bold text-navy mt-0.5 truncate">
                  {displayClassification(resultData.classification)}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 col-span-2">
                <p className="text-[10px] text-muted font-semibold uppercase tracking-widest">Perihal</p>
                <p className="text-sm font-bold text-navy mt-0.5">{resultData.subject}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 col-span-2">
                <p className="text-[10px] text-muted font-semibold uppercase tracking-widest">Tujuan</p>
                <p className="text-sm font-bold text-navy mt-0.5">{resultData.destination}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 col-span-2">
                <p className="text-[10px] text-muted font-semibold uppercase tracking-widest">Sifat Surat</p>
                <p className="text-sm font-bold text-navy mt-0.5">
                  {/* Tampilkan label yang mudah dibaca dari nilai enum */}
                  {{
                    sangat_segera: 'Sangat Segera',
                    segera:        'Segera',
                    biasa:         'Biasa',
                    rahasia:       'Rahasia',
                  }[resultData.sifat_surat] ?? resultData.sifat_surat}
                </p>
              </div>
            </div>

            {/* Tombol aksi */}
            <div className="flex gap-3 pt-2 border-t border-[#E2E8F0]">
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
