import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../hooks/useToast';
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadPhoto,
  deletePhoto,
} from '../api/profile.api';
import Button from '../components/ui/Button';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

// ─── Skeleton ────────────────────────────────────────────────────────────────
function SkeletonRow({ wide = false }) {
  return (
    <div
      className={`h-4 bg-[#E2E8F0] rounded animate-pulse ${wide ? 'w-3/4' : 'w-1/2'}`}
    />
  );
}

// ─── PasswordInput ────────────────────────────────────────────────────────────
function PasswordInput({ id, label, value, onChange, error }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className={`w-full border rounded-lg px-3 py-2 text-sm text-[#0B1F3A] pr-10 focus:outline-none focus:ring-2 focus:ring-[#2A7FD4] transition ${
            error ? 'border-red-400 bg-red-50' : 'border-[#E2E8F0] bg-white'
          }`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0B1F3A] transition"
          tabIndex={-1}
        >
          {show ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ─── ProfilePage ──────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, updateProfile: syncStore } = useAuthStore();
  const toast = useToast();

  // ── Fetch state ──
  const [loading, setLoading] = useState(true);

  // ── Section 1: Photo ──
  const fileInputRef = useRef(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoDeleting, setPhotoDeleting] = useState(false);
  const [photoError, setPhotoError] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(null);

  // ── Section 2: Edit Info ──
  const [name, setName] = useState('');
  const [division, setDivision] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoError, setInfoError] = useState(null);

  // ── Section 3: Change Password ──
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwErrors, setPwErrors] = useState({});

  // ─── Fetch initial profile ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getProfile();
        const data = res.data?.data ?? res.data;
        if (!cancelled) {
          setName(data.name ?? '');
          setDivision(data.division ?? '');
          setEmail(data.email ?? '');
          setRole(data.role ?? '');
          setCurrentPhoto(data.profile_photo ?? null);
        }
      } catch {
        /* authStore sudah memiliki data dasar dari login */
        if (!cancelled) {
          setName(user?.name ?? '');
          setDivision(user?.division ?? '');
          setEmail(user?.email ?? '');
          setRole(user?.role ?? '');
          setCurrentPhoto(user?.profile_photo ?? null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, []);

  // ─── Section 1 handlers ──────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);

    // Validasi tipe
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setPhotoError('Hanya file JPEG atau PNG yang diizinkan.');
      e.target.value = '';
      return;
    }

    // Validasi ukuran (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('Ukuran file maksimal 2MB.');
      e.target.value = '';
      return;
    }

    // Baca sebagai base64 lalu kirim
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      setPhotoUploading(true);
      try {
        const res = await uploadPhoto(base64);
        const data = res.data?.data ?? res.data;
        const newPhoto = data?.profile_photo ?? base64;
        setCurrentPhoto(newPhoto);
        syncStore({ profile_photo: newPhoto });
        toast.success('Foto profil berhasil diperbarui.');
      } catch (err) {
        setPhotoError(err.response?.data?.message ?? 'Gagal mengunggah foto.');
      } finally {
        setPhotoUploading(false);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = async () => {
    setPhotoDeleting(true);
    setPhotoError(null);
    try {
      await deletePhoto();
      setCurrentPhoto(null);
      syncStore({ profile_photo: null });
      toast.success('Foto profil berhasil dihapus.');
    } catch (err) {
      setPhotoError(err.response?.data?.message ?? 'Gagal menghapus foto.');
    } finally {
      setPhotoDeleting(false);
    }
  };

  // ─── Section 2 handler ───────────────────────────────────────────────────
  const handleInfoSave = async (e) => {
    e.preventDefault();
    setInfoError(null);
    setInfoSaving(true);
    try {
      const res = await updateProfile({ name: name.trim(), division: division.trim() });
      const data = res.data?.data ?? res.data;
      syncStore({ name: data.name ?? name, division: data.division ?? division });
      toast.success('Profil berhasil diperbarui.');
    } catch (err) {
      setInfoError(err.response?.data?.message ?? 'Gagal menyimpan perubahan.');
    } finally {
      setInfoSaving(false);
    }
  };

  // ─── Section 3 handler ───────────────────────────────────────────────────
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errors = {};

    if (newPassword.length < 8) {
      errors.newPassword = 'Password baru minimal 8 karakter.';
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password tidak cocok.';
    }

    if (Object.keys(errors).length > 0) {
      setPwErrors(errors);
      return;
    }

    setPwErrors({});
    setPwSaving(true);
    try {
      await changePassword({
        current_password: oldPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password berhasil diubah.');
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message ?? 'Gagal mengganti password.';

      if (status === 422) {
        // Password lama salah atau validasi server
        const serverErrors = err.response?.data?.errors ?? {};
        setPwErrors({
          oldPassword: serverErrors.current_password?.[0] ?? message,
          ...( serverErrors.password ? { newPassword: serverErrors.password[0] } : {}),
        });
      } else {
        setPwErrors({ general: message });
      }
    } finally {
      setPwSaving(false);
    }
  };

  // ─── Avatar ──────────────────────────────────────────────────────────────
  const avatarInitial = (name || user?.name || 'U').charAt(0).toUpperCase();

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold text-[#0B1F3A]">Profil Saya</h1>
        <p className="text-xs text-[#94A3B8] mt-0.5">Kelola informasi akun dan keamanan Anda.</p>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 1 — Info & Foto Profil
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="h-2 w-2 rounded-full bg-[#2A7FD4]" />
          <h2 className="text-xs uppercase tracking-widest text-[#64748B] font-semibold">Info &amp; Foto Profil</h2>
        </div>

        {loading ? (
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-[#E2E8F0] animate-pulse shrink-0" />
            <div className="space-y-2 flex-1">
              <SkeletonRow wide />
              <SkeletonRow />
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Avatar (80×80) */}
            {currentPhoto ? (
              <img
                src={currentPhoto}
                alt="Foto Profil"
                className="h-20 w-20 rounded-full object-cover ring-2 ring-[#2A7FD4]/40 shrink-0"
              />
            ) : (
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-[#0B1F3A] text-white text-2xl font-bold shrink-0">
                {avatarInitial}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  loading={photoUploading}
                  disabled={photoUploading || photoDeleting}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Ganti Foto
                </Button>

                {currentPhoto && (
                  <Button
                    variant="danger"
                    size="sm"
                    loading={photoDeleting}
                    disabled={photoUploading || photoDeleting}
                    onClick={handleDeletePhoto}
                  >
                    Hapus Foto
                  </Button>
                )}
              </div>

              {photoError && (
                <p className="text-xs text-red-600">{photoError}</p>
              )}
              <p className="text-[10px] text-[#94A3B8]">JPEG atau PNG, maks 2MB.</p>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 2 — Edit Info Profil
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="h-2 w-2 rounded-full bg-[#2A7FD4]" />
          <h2 className="text-xs uppercase tracking-widest text-[#64748B] font-semibold">Edit Info Profil</h2>
        </div>

        {loading ? (
          <div className="space-y-4">
            <SkeletonRow wide />
            <SkeletonRow />
            <SkeletonRow wide />
          </div>
        ) : (
          <form onSubmit={handleInfoSave} className="space-y-4">
            {/* Nama */}
            <div>
              <label htmlFor="profile-name" className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">
                Nama
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#0B1F3A] focus:outline-none focus:ring-2 focus:ring-[#2A7FD4] bg-white transition"
              />
            </div>

            {/* Divisi */}
            <div>
              <label htmlFor="profile-division" className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">
                Divisi
              </label>
              <input
                id="profile-division"
                type="text"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#0B1F3A] focus:outline-none focus:ring-2 focus:ring-[#2A7FD4] bg-white transition"
              />
            </div>

            {/* Email — read-only */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">Email</p>
              <p className="text-sm text-[#64748B] px-3 py-2 bg-[#F7F9FC] rounded-lg border border-[#E2E8F0]">
                {email}
              </p>
            </div>

            {/* Role — read-only */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">Role</p>
              <span
                className={`inline-block text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-lg ${
                  role === 'admin'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-[#EBF4FD] text-[#185FA5]'
                }`}
              >
                {role}
              </span>
            </div>

            {infoError && (
              <p className="text-xs text-red-600">{infoError}</p>
            )}

            <Button type="submit" variant="primary" size="md" loading={infoSaving}>
              Simpan Perubahan
            </Button>
          </form>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 3 — Ganti Password
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="h-2 w-2 rounded-full bg-[#2A7FD4]" />
          <h2 className="text-xs uppercase tracking-widest text-[#64748B] font-semibold">Ganti Password</h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <PasswordInput
            id="old-password"
            label="Password Lama"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            error={pwErrors.oldPassword}
          />

          <PasswordInput
            id="new-password"
            label="Password Baru"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={pwErrors.newPassword}
          />

          <PasswordInput
            id="confirm-password"
            label="Konfirmasi Password Baru"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={pwErrors.confirmPassword}
          />

          {pwErrors.general && (
            <p className="text-xs text-red-600">{pwErrors.general}</p>
          )}

          <Button type="submit" variant="primary" size="md" loading={pwSaving}>
            Ganti Password
          </Button>
        </form>
      </div>
    </div>
  );
}
