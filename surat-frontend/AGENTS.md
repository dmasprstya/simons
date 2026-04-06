# Konteks Project: Frontend Sistem Penomoran Surat

## Stack
- Framework: React + Vite (versi terbaru stabil)
- State management: Zustand
- HTTP client: Axios dengan interceptor token
- Routing: React Router v6
- UI: Shadcn/ui (dibangun di atas Radix UI + Tailwind CSS)
- Bahasa: Indonesia untuk semua label, pesan error, dan teks UI

## Struktur Folder
```
surat-frontend/
  src/
    api/          ← axios instance + fungsi per endpoint
    components/
      ui/         ← komponen reusable (Button, Modal, Table, dll)
      layout/     ← Sidebar, Navbar, layout wrapper
    pages/
      auth/       ← Login
      user/       ← halaman untuk role user
      admin/      ← halaman untuk role admin
    store/        ← Zustand stores
    hooks/        ← custom hooks
    utils/        ← helper functions
```

## Aturan Wajib
- Semua request API melalui fungsi di `src/api/` — JANGAN fetch langsung di komponen
- Token disimpan di Zustand (`authStore`) + localStorage untuk persist
- Interceptor Axios: inject token di header, handle 401 dengan auto-logout
- JANGAN mock data atau hardcode response — semua dari backend
- Gunakan React Router loader/action atau useEffect untuk fetch data
- Tangani loading state dan error state di setiap halaman yang fetch data
- Setiap halaman admin hanya bisa diakses role admin (ProtectedRoute)
- Setelah selesai tiap fase: tampilkan checklist, tunggu konfirmasi sebelum lanjut

## URL Backend
```
VITE_API_URL=http://localhost:8000/api
```
(diambil dari `.env` — jangan hardcode URL di kode)

## Role & Akses

| Role  | Halaman yang Dapat Diakses |
|-------|---------------------------|
| user  | Dashboard, TakeNumber, MyLetters, GapRequest |
| admin | Semua halaman user + AllLetters, GapRequests (admin), SequenceSettings, Users, Classifications, AuditLogs, Reports |

## Pola Response API Backend

```json
// Sukses biasa
{ "data": ..., "message": "..." }

// Sukses paginated
{ "data": [...], "meta": { "current_page": 1, "last_page": 5, "per_page": 15, "total": 72 } }

// Error (HTTP 4xx/5xx)
{ "message": "Deskripsi error" }
```

## Pola Axios & Auth

```js
// src/api/axiosInstance.js
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Pola Zustand Store

```js
// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'auth-storage' }
  )
);
```

## Endpoint API Utama

| Metode | Path | Keterangan |
|--------|------|------------|
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Profil user aktif |
| GET | `/letter-numbers` | Daftar nomor surat |
| POST | `/letter-numbers/take` | Ambil nomor surat |
| GET | `/gap-requests` | Daftar gap request |
| POST | `/gap-requests` | Buat gap request |
| PATCH | `/gap-requests/{id}/approve` | Approve gap request (admin) |
| PATCH | `/gap-requests/{id}/reject` | Reject gap request (admin) |
| GET | `/users` | Daftar user (admin) |
| GET | `/classifications` | Daftar klasifikasi surat |
| GET | `/daily-sequences` | Data urutan harian |
| GET | `/audit-logs` | Log audit (admin) |
| GET | `/reports/export` | Export laporan (admin) |

## Konvensi Kode
- Komponen: PascalCase (`LetterTable.jsx`)
- File store/hook/util: camelCase (`authStore.js`, `useLetterNumbers.js`)
- Setiap komponen memiliki satu tanggung jawab (Single Responsibility)
- Gunakan `async/await` + try/catch di setiap fungsi API
- Error dari API ditampilkan dalam bahasa Indonesia yang ramah pengguna
