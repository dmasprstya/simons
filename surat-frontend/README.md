# Surat Frontend

Frontend untuk **SIMONS** (Sistem Informasi Manajemen Penomoran Surat), dibangun menggunakan React + Vite.

## Instalasi

```bash
cp .env.example .env
npm install
npm run build
```

## Development (untuk development saja, bukan testing)

```bash
npm run dev
```

## Struktur Halaman

### User

| Route              | Halaman                           |
|--------------------|-----------------------------------|
| `/login`           | Login                             |
| `/dashboard`       | Dashboard + info sequence hari ini|
| `/letters/take`    | Ambil nomor surat                 |
| `/letters`         | Riwayat surat                     |
| `/gap-requests`    | Request nomor gap                 |

### Admin (tambahan)

| Route                    | Halaman                    |
|--------------------------|----------------------------|
| `/admin/dashboard`       | Monitoring                 |
| `/admin/letters`         | Semua surat                |
| `/admin/gap-requests`    | Kelola gap request         |
| `/admin/sequences`       | Pengaturan sequence & gap size |
| `/admin/users`           | Kelola user                |
| `/admin/classifications` | Kelola klasifikasi         |
| `/admin/audit-logs`      | Audit log                  |
| `/admin/reports`         | Laporan & export           |

## Koneksi Backend

Set `VITE_API_URL` di file `.env` ke URL backend Laravel.

```env
VITE_API_URL=http://localhost:8000/api
```

## Tech Stack

- **Framework**: React 18 + Vite 5
- **State Management**: Zustand
- **HTTP Client**: Axios (dengan interceptor token)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI + Heroicons
