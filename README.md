# 📄 SIMONS — Sistem Informasi Manajemen Penomoran Surat

![Laravel](https://img.shields.io/badge/Backend-Laravel_12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Vite](https://img.shields.io/badge/Bundler-Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)

Aplikasi penomoran surat resmi berbasis **Permenkumham No. 5 Tahun 2022**. SIMONS mengotomasi proses pengambilan, pencatatan, dan pelaporan nomor surat dengan sistem **Linear Daily Gap Rollover** yang menjamin ketersediaan nomor cadangan (gap) setiap pergantian hari dan konsistensi penomoran yang profesional. Menggunakan branding warna resmi Kemenkumham (**Kemenkumham Blue & Gold**).

---

## 📑 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Arsitektur Aplikasi](#-arsitektur-aplikasi)
- [Prasyarat](#-prasyarat)
- [Instalasi & Setup](#-instalasi--setup)
  - [Backend (Laravel)](#1-backend-laravel)
  - [Frontend (React)](#2-frontend-react)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Akun Default](#-akun-default)
- [Panduan Penggunaan](#-panduan-penggunaan)
  - [Untuk User Biasa](#-untuk-user-biasa)
  - [Untuk Admin](#-untuk-admin)
- [Cara Kerja Penomoran (Linear Daily Gap)](#-cara-kerja-penomoran-linear-daily-gap)
- [Struktur Halaman](#-struktur-halaman)
- [API Reference](#-api-reference)
- [Penanganan Error](#-penanganan-error)
- [Testing](#-testing)
- [Deployment (Produksi)](#-deployment-produksi)
- [Struktur Project](#-struktur-project)
- [Tech Stack](#-tech-stack)

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🔢 **Penomoran Otomatis** | Pengambilan nomor surat berurutan secara linear dengan sistem daily gap rollover |
| 📂 **Klasifikasi Hierarki** | 3 level klasifikasi surat sesuai Permenkumham (Tree View/Breadcrumb) |
| 📋 **Riwayat Surat** | Pencarian, filter, dan pelacakan semua surat yang diterbitkan |
| 🔄 **Gap Request** | Permintaan nomor dari zona cadangan (gap) dengan approval admin |
| 📊 **Dashboard & Laporan** | Statistik real-time, grafik, dan ekspor data (PDF/CSV/JSON) |
| 👥 **Manajemen User** | CRUD user, toggle aktif/nonaktif, role-based access |
| 🔍 **Audit Log** | Pencatatan otomatis setiap aksi penting (JSON diff) |
| 🔄 **Rollover Harian** | Pengarsipan nomor gap otomatis saat pertama kali ambil nomor di hari baru |
| 🔐 **Autentikasi Aman** | Bearer token via Laravel Sanctum |
| 🚫 **Void Surat** | Pembatalan surat yang sudah diterbitkan |
| 🎨 **Premium Branding** | UI Modern dengan palet warna resmi Kemenkumham |

---

## 🏗 Arsitektur Aplikasi

```
┌──────────────────────────────────────────────────────────────┐
│                        SIMONS                                │
├───────────────────────────┬──────────────────────────────────┤
│     surat-frontend/       │       surat-backend/             │
│                           │                                  │
│  React 18 + Vite 5        │  Laravel 12 + Sanctum            │
│  Zustand (state)          │  MySQL (database)                │
│  Axios (HTTP client)      │  Service Layer pattern           │
│  React Router v6          │  Form Request validation         │
│  Tailwind CSS             │  API Resource transform          │
│  Headless UI + Heroicons  │  Observer (auto-audit)           │
│                           │  Scheduled Jobs (sequence)       │
│                           │                                  │
│    Berkomunikasi via      │  Response format:                │
│    REST API (JSON)   ────►│  { data, message, meta }         │
└───────────────────────────┴──────────────────────────────────┘
```

---

## 📋 Prasyarat

Pastikan software berikut sudah terinstal di mesin Anda:

| Software | Versi Minimum | Keterangan |
|----------|---------------|------------|
| **PHP** | 8.2+ | Dengan ekstensi: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json` |
| **Composer** | 2.x | Package manager PHP |
| **Node.js** | 18+ | Runtime JavaScript |
| **npm** | 9+ | Package manager Node.js |
| **MySQL** | 8.0+ | Database server |
| **Git** | 2.x | Version control |

---

## 🚀 Instalasi & Setup

### 1. Backend (Laravel)

```bash
# Masuk ke direktori backend
cd surat-backend

# Salin file konfigurasi environment
cp .env.example .env

# Install dependencies PHP
composer install

# Generate application key
php artisan key:generate
```

**Konfigurasi Database** — Edit file `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=surat_db
DB_USERNAME=root
DB_PASSWORD=password_anda

SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1
```

> ⚠️ **Penting:** Pastikan database `surat_db` sudah dibuat di MySQL sebelum menjalankan migrasi.

```bash
# Jalankan migrasi & seed data awal
php artisan migrate --seed

# Bersihkan token expired (opsional)
php artisan sanctum:prune-expired --hours=24
```

Seeder akan membuat:
1. **AdminSeeder** → Akun admin default
2. **LetterClassificationSeeder** → 35 klasifikasi surat (5 root, 15 sub, 15 leaf) sesuai Permenkumham
3. **DailySequenceSeeder** → Verifikasi konfigurasi numbering

---

### 2. Frontend (React)

```bash
# Masuk ke direktori frontend
cd surat-frontend

# Salin file environment
cp .env.example .env

# Install dependencies
npm install

# Build untuk produksi (verifikasi)
npm run build
```

**Konfigurasi Koneksi Backend** — Edit file `.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

> Sesuaikan URL dengan alamat server backend Laravel Anda.

---

## ▶ Menjalankan Aplikasi

### Development Mode

**Terminal 1 — Backend:**
```bash
cd surat-backend
php artisan serve
# Server berjalan di http://localhost:8000
```

**Terminal 2 — Frontend:**
```bash
cd surat-frontend
npm run dev
# Server berjalan di http://localhost:5173
```

### Alternatif (satu perintah via Composer):
```bash
cd surat-backend
composer run dev
# Menjalankan: Laravel server + Queue + Pail logs + Vite secara bersamaan
```

---

## 🔑 Akun Default

Setelah menjalankan `php artisan migrate --seed`, akun berikut tersedia:

| Field | Nilai |
|-------|-------|
| **Email** | `admin@surat.local` |
| **Password** | `password` |
| **Role** | `admin` |
| **Divisi** | `TU` |

> ⚠️ **Segera ganti password** setelah login pertama kali melalui menu profil.

---

## 📖 Panduan Penggunaan

### 👤 Untuk User Biasa

#### 1. Login
1. Buka aplikasi di browser
2. Masukkan email dan password
3. Klik **Masuk** — Anda akan diarahkan ke Dashboard

#### 2. Dashboard
- Menampilkan **ringkasan hari ini**: jumlah surat diambil, sisa nomor aktif, info sequence
- Statistik surat Anda secara keseluruhan

#### 3. Ambil Nomor Surat (`/letters/take`)
1. Pilih **Klasifikasi Surat** melalui classification picker (navigasi hierarki 3 level)
2. Isi **Perihal** surat
3. Isi **Tujuan** surat
4. Pilih **Tanggal** penerbitan
5. Klik **Ambil Nomor** — sistem akan memberikan nomor secara otomatis
6. Nomor yang diterbitkan ditampilkan di layar

> 💡 Nomor surat dialokasikan secara berurutan secara linear. Jika berganti hari, sistem otomatis melompati sejumlah nomor (gap size) sebagai cadangan yang dapat diminta melalui fitur Request Gap.

#### 4. Riwayat Surat Saya (`/letters`)
- Melihat semua surat yang pernah Anda ambil
- Filter berdasarkan: tanggal, klasifikasi, status
- Fitur **Void**: batalkan surat yang salah (ubah status ke `void`)

#### 5. Request Gap (`/gap-requests`)
- **Mengapa ada gap?** Kadang diperlukan nomor surat dari zona cadangan (misalnya untuk surat tertanggal mundur)
- **Cara request:**
  1. Pilih klasifikasi surat
  2. Pilih tanggal gap
  3. Masukkan nomor yang diminta (harus dalam zona gap)
  4. Isi alasan (maks. 500 karakter)
  5. Kirim — tunggu approval admin
- **Status request:** `pending` → `approved` / `rejected`
- Jika disetujui, nomor gap akan otomatis diterbitkan sebagai LetterNumber

---

### 🛡 Untuk Admin

Admin memiliki semua akses user biasa, ditambah fitur berikut:

#### 1. Admin Dashboard (`/admin/dashboard`)
- **Monitoring real-time**: total surat hari ini, total user aktif, pending gap request
- Statistik penggunaan per klasifikasi
- Grafik tren penomoran

#### 2. Semua Surat (`/admin/letters`)
- Melihat **semua surat dari seluruh user**
- Filter: tanggal, klasifikasi, user, status
- Ekspor data surat

#### 3. Kelola Gap Request (`/admin/gap-requests`)
- Tabel semua gap request dari seluruh user
- Aksi per request:
  - ✅ **Approve** — nomor gap diterbitkan secara otomatis
  - ❌ **Reject** — request ditolak dengan catatan
- Detail: pemohon, klasifikasi, nomor diminta, alasan

#### 4. Pengaturan Sequence (`/admin/sequences`)
- Melihat daftar sequence harian per klasifikasi
- **Update Gap Size** — mengubah jumlah nomor per zona (aktif & gap)
- Info: `next_start`, `last_number`, `gap_size` untuk setiap sequence

#### 5. Manajemen User (`/admin/users`)
- **Tambah user** baru (nama, email, password, divisi, role)
- **Edit user** (nama, email, divisi, role)
- **Toggle Aktif/Nonaktif** — user nonaktif tidak bisa login (middleware return 403)

#### 6. Kelola Klasifikasi (`/admin/classifications`)
- **Tree View** hierarki klasifikasi surat (3 level)
- Tambah klasifikasi baru (root, sub, atau leaf)
- Edit nama, kode, tipe (substantif/fasilitatif)
- Toggle aktif/nonaktif klasifikasi

#### 7. Audit Log (`/admin/audit-logs`)
- Riwayat semua aksi penting yang dicatat sistem
- Detail: siapa, kapan, aksi apa, data sebelum & sesudah (JSON diff)
- Filter: user, action, tanggal

#### 8. Laporan (`/admin/reports`)
- **Summary**: ringkasan statistik surat (per klasifikasi, per user, per periode)
- **Export**: unduh data dalam format **PDF** (dengan branding Kemenkumham), **CSV** atau **JSON**
- Filter periode laporan

---

## 🔢 Cara Kerja Penomoran (Linear Daily Gap)

Sistem menggunakan alur penomoran **Linear** yang diselingi oleh **Gap** setiap kali terjadi pergantian hari (rollover). Hal ini memastikan setiap hari memiliki blok nomor cadangan yang bisa diminta (request) untuk surat tertanggal mundur.

### Logika Rollover

1.  **Pengambilan Nomor**: Nomor diterbitkan secara berurutan (`last_number + 1`).
2.  **Deteksi Hari**: Saat pengambilan nomor pertama di hari yang baru, sistem melakukan **Rollover**:
    -   Mengarsipkan nomor cadangan (gap) sebanyak `gap_size`.
    -   `gap_start` = `last_number + 1`.
    -   `gap_end` = `last_number + gap_size`.
    -   Nomor baru untuk hari tersebut dimulai dari `gap_end + 1`.
3.  **Arsip Gap**: Range gap (`gap_start` s/d `gap_end`) disimpan di tabel `daily_gaps` dengan referensi tanggal hari sebelumnya.

### Visualisasi (default_start=1000, gap_size=10)

| Hari | Aktivitas | Range Nomor Aktif | Zona Gap Terarsip |
| :--- | :--- | :--- | :--- |
| **Senin** | Ambil surat terakhir: 1076 | 1000 – 1076 | - |
| **Selasa** | Ambil surat pertama (Rollover) | **1087** – ... | 1077 – 1086 (Date: Senin) |
| **Selasa** | Ambil surat terakhir: 1102 | 1087 – 1102 | - |
| **Rabu** | Ambil surat pertama (Rollover) | **1113** – ... | 1103 – 1112 (Date: Selasa) |

### Aturan Bisnis

| Fungsi | Perilaku |
|--------|----------|
| `acquireNumber()` | Mengambil nomor berikutnya dari zona **aktif** saja |
| `releaseGapNumber()` | Menerbitkan nomor dari zona **gap** (harus lewat approval admin) |
| **Auto-skip** | Jika nomor berikutnya jatuh di zona gap, otomatis lompat ke `aktif_start` blok selanjutnya |
| `prepareNextDay()` | Menyiapkan `next_start` untuk hari berikutnya (dijalankan 23:55 tiap malam) |

### Concurrency Safety

- MySQL: **Pessimistic locking** (`SELECT ... FOR UPDATE`) untuk mencegah race condition
- Deadlock: retry otomatis hingga 3 kali, lalu throw `NumberingLockException` (HTTP 409)
- Duplikat: guard tambahan — cek nomor belum dipakai sebelum insert

---

## 🗺 Struktur Halaman

### Halaman User

| Route | Halaman | Deskripsi |
|-------|---------|-----------|
| `/login` | Login | Halaman autentikasi |
| `/dashboard` | Dashboard | Ringkasan & info sequence hari ini |
| `/letters/take` | Ambil Nomor | Form pengambilan nomor surat baru |
| `/letters` | Riwayat Surat | Daftar surat milik user yang login |
| `/gap-requests` | Request Gap | Ajukan & lihat riwayat gap request |

### Halaman Admin

| Route | Halaman | Deskripsi |
|-------|---------|-----------|
| `/admin/dashboard` | Dashboard Admin | Monitoring & statistik keseluruhan |
| `/admin/letters` | Semua Surat | Data surat seluruh user |
| `/admin/gap-requests` | Kelola Gap Request | Approve / reject gap request |
| `/admin/sequences` | Pengaturan Sequence | Konfigurasi gap size & sequence |
| `/admin/users` | Manajemen User | CRUD & toggle status user |
| `/admin/classifications` | Kelola Klasifikasi | Tree view & CRUD klasifikasi |
| `/admin/audit-logs` | Audit Log | Riwayat aksi (JSON diff viewer) |
| `/admin/reports` | Laporan | Summary, chart, & export |

---

## 📡 API Reference

Semua endpoint menggunakan prefix `/api` dan mengembalikan format JSON:
```json
{
  "data": { ... },
  "message": "Deskripsi hasil",
  "meta": { "current_page": 1, "last_page": 5, "total": 50 }
}
```
> `meta` hanya muncul pada response yang mendukung paginasi.

### 🔐 Auth (`/api/auth`)
| Method | Endpoint | Middleware | Deskripsi |
|--------|----------|------------|-----------|
| POST | `/api/auth/login` | — | Login, mendapat Bearer token |
| POST | `/api/auth/logout` | auth, active | Logout (revoke token) |
| GET | `/api/auth/me` | auth, active | Profil user yang login |
| POST | `/api/auth/change-password` | auth, active | Ganti password |

### 👤 Users (`/api/users`) — Admin Only
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/users` | Daftar semua user |
| POST | `/api/users` | Buat user baru |
| GET | `/api/users/{id}` | Detail user |
| PUT | `/api/users/{id}` | Update user |
| PATCH | `/api/users/{id}/toggle-active` | Toggle aktif/nonaktif |

### 📂 Klasifikasi (`/api/classifications`)
| Method | Endpoint | Middleware | Deskripsi |
|--------|----------|------------|-----------|
| GET | `/api/classifications` | auth, active | Daftar klasifikasi |
| POST | `/api/classifications` | admin | Buat klasifikasi |
| GET | `/api/classifications/{id}` | auth, active | Detail klasifikasi |
| PUT | `/api/classifications/{id}` | admin | Update klasifikasi |
| GET | `/api/classifications/{id}/children` | auth, active | Sub-klasifikasi |
| PATCH | `/api/classifications/{id}/toggle-active` | admin | Toggle aktif |

### 📋 Nomor Surat (`/api/letters`)
| Method | Endpoint | Middleware | Deskripsi |
|--------|----------|------------|-----------|
| GET | `/api/letters` | auth, active | Surat milik user login |
| POST | `/api/letters` | auth, active | Request nomor surat baru |
| GET | `/api/letters/all` | admin | Semua surat (admin) |
| GET | `/api/letters/{id}` | auth, active | Detail surat |
| PATCH | `/api/letters/{id}/void` | auth, active | Void surat |

### 📦 Gap Request (`/api/gap-requests`)
| Method | Endpoint | Middleware | Deskripsi |
|--------|----------|------------|-----------|
| GET | `/api/gap-requests` | auth, active | Gap request milik user login |
| POST | `/api/gap-requests` | auth, active | Ajukan gap request |
| GET | `/api/gap-requests/all` | admin | Semua gap request |
| PATCH | `/api/gap-requests/{id}/approve` | admin | Setujui gap request |
| PATCH | `/api/gap-requests/{id}/reject` | admin | Tolak gap request |

### 📅 Daily Sequence (`/api/sequences`)
| Method | Endpoint | Middleware | Deskripsi |
|--------|----------|------------|-----------|
| GET | `/api/sequences` | admin | Daftar sequence |
| GET | `/api/sequences/today` | auth, active | Sequence hari ini |
| PATCH | `/api/sequences/gap` | admin | Update gap size |

### 📊 Laporan (`/api/reports`) — Admin Only
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/reports/summary` | Ringkasan statistik |
| GET | `/api/reports/export` | Export data (PDF/CSV/JSON) |

### 🔍 Audit Log (`/api/audit-logs`) — Admin Only
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/audit-logs` | Daftar audit log |
| GET | `/api/audit-logs/{id}` | Detail audit log |

---

## ⚠ Penanganan Error

| Kondisi | HTTP Status | Exception / Keterangan |
|---------|-------------|------------------------|
| Lock timeout / deadlock | **409** | `NumberingLockException` |
| Nomor gap sudah digunakan | **422** | `GapAlreadyUsedException` |
| User nonaktif mencoba akses | **403** | Middleware `EnsureUserIsActive` |
| Validasi input gagal | **422** | Laravel Form Request |
| Token tidak valid / expired | **401** | Laravel Sanctum |
| Resource tidak ditemukan | **404** | Model not found |
| Akses tanpa role admin | **403** | Middleware `role:admin` |

---

## 🧪 Testing

### Menjalankan Tests

```bash
cd surat-backend
php artisan test
```

### Test Suite

| Test File | Cakupan |
|-----------|---------|
| `AuthTest.php` | Login, logout, profil, ganti password |
| `LetterNumberTest.php` | Pengambilan nomor, void, filter & pagination |
| `GapRequestTest.php` | Create, approve, reject, validasi zona gap |
| `NumberingConcurrencyTest.php` | Race condition, deadlock handling, skip gap |

### Verifikasi Lainnya

```bash
# Cek daftar route
php artisan route:list

# Cek status migrasi
php artisan migrate:status
```

---

## 🌐 Deployment (Produksi)

### 1. Backend

```bash
cd surat-backend

# Optimasi
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Migrasi
php artisan migrate --force --seed
```

### 2. Frontend

```bash
cd surat-frontend

# Set environment produksi
echo "VITE_API_URL=https://api.domain-anda.com/api" > .env

# Build
npm ci
npm run build
# Hasil build di folder dist/ — serve via Nginx/Apache
```

### 3. Scheduled Job (Cron)

Job `CalculateNextDaySequence` berjalan tiap malam pukul **23:55** untuk menyiapkan sequence hari berikutnya.

```cron
* * * * * cd /path/to/surat-backend && php artisan schedule:run >> /dev/null 2>&1
```

### 4. Konfigurasi Web Server (Nginx)

```nginx
# Backend API
server {
    listen 80;
    server_name api.domain-anda.com;
    root /path/to/surat-backend/public;

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}

# Frontend SPA
server {
    listen 80;
    server_name domain-anda.com;
    root /path/to/surat-frontend/dist;

    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📁 Struktur Project

```
aplikasi/
├── surat-backend/                # Laravel 12 Backend
│   ├── app/
│   │   ├── Exceptions/           # Custom exceptions (NumberingLock, GapAlreadyUsed)
│   │   ├── Http/
│   │   │   ├── Controllers/      # 8 controllers (Auth, User, Letter, dll.)
│   │   │   ├── Middleware/       # EnsureUserIsActive, EnsureRole
│   │   │   ├── Requests/        # Form Request validation
│   │   │   └── Resources/       # API Resource transformers
│   │   ├── Jobs/                 # CalculateNextDaySequence
│   │   ├── Models/               # 6 models (User, LetterNumber, dll.)
│   │   ├── Observers/           # Auto-audit via model events
│   │   ├── Providers/
│   │   └── Services/            # Business logic layer
│   │       ├── AuditService.php
│   │       ├── ExportService.php
│   │       ├── GapRequestService.php
│   │       └── NumberingService.php    # ⭐ Core numbering logic
│   ├── database/
│   │   ├── migrations/          # 10 migration files
│   │   └── seeders/             # Admin, Classification, Sequence
│   ├── routes/
│   │   └── api.php              # 30+ API endpoints
│   └── tests/Feature/           # 4 feature test files
│
├── surat-frontend/               # React 18 + Vite 5 Frontend
│   └── src/
│       ├── api/                  # Axios service modules (8 API files)
│       ├── components/
│       │   ├── layout/          # Sidebar, Navbar, UserLayout
│       │   ├── ui/              # Button, Modal, Table, Badge, Toast, dll.
│       │   ├── ProtectedRoute.jsx
│       │   ├── AdminRoute.jsx
│       │   └── ErrorBoundary.jsx
│       ├── hooks/               # 11 custom hooks (useAuth, useLetters, dll.)
│       ├── pages/
│       │   ├── auth/            # LoginPage
│       │   ├── user/            # Dashboard, TakeNumber, MyLetters, GapRequest
│       │   ├── admin/           # 8 admin pages
│       │   └── NotFoundPage.jsx
│       ├── store/               # Zustand stores (auth, classification, sequence)
│       └── utils/               # Helper & formatter functions
│
├── AGENTS.md                     # Aturan development & logika gap
├── .gitignore
└── README.md                     # ← Anda sedang membaca ini
```

---

## 🛠 Tech Stack

### Backend

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Laravel | 12.x | Framework PHP |
| Laravel Sanctum | 4.3+ | Autentikasi API (Bearer token) |
| Spatie Query Builder | 6.4+ | Filter & sort di endpoint GET |
| MySQL | 8.0+ | Database relasional |
| PHPUnit | 11.5+ | Unit & feature testing |

### Frontend

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| React | 18.3 | UI library |
| Vite | 5.4 | Build tool & dev server |
| Zustand | 5.0 | State management (ringan) |
| Axios | 1.14 | HTTP client + interceptor |
| React Router | 7.14 | Client-side routing |
| Tailwind CSS | 3.4 | Utility-first CSS (Kemenkumham Palette) |
| Headless UI | 2.2 | Accessible UI primitives |
| Heroicons | 2.2 | Icon SVG library |

### Patterns

- **Service Layer** → Logika bisnis terisolasi dari controller
- **Form Request** → Validasi input terpisah dari controller
- **API Resource** → Transformasi response konsisten
- **Observer** → Auto-audit saat model berubah
- **Custom Hooks** → Reusable data-fetching logic di React

---

## 📄 Lisensi

Aplikasi ini dikembangkan untuk keperluan internal penomoran surat resmi.

---

<p align="center">
  Dibuat dengan ❤️ menggunakan Laravel + React
</p>
