# Surat Backend

Sistem penomoran surat resmi berbasis Permenkumham No. 5 Tahun 2022.

---

## Instalasi

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan sanctum:prune-expired --hours=24
```

Pastikan konfigurasi database di `.env` sudah benar (DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD) sebelum menjalankan migrasi.

---

## Cara Kerja Penomoran

Nomor surat dibagi dalam blok. Setiap blok = N nomor aktif + N nomor cadangan (zona gap).

**Default:** `gap_size=10`, `start=1000`

| Blok | Nomor Aktif  | Zona Gap    |
|------|-------------|-------------|
| 1    | 1000–1009   | 1010–1019   |
| 2    | 1020–1029   | 1030–1039   |
| 3    | 1040–1049   | 1050–1059   |

**Formula zona gap untuk blok ke-N (N dimulai dari 0):**
```
aktif_start = default_start + N × (gap_size × 2)
aktif_end   = aktif_start + gap_size − 1
gap_start   = aktif_end + 1
gap_end     = gap_start + gap_size − 1
```

**Aturan nomor:**
- `acquireNumber()` hanya mengeluarkan nomor dalam range `aktif_start–aktif_end`.
- `releaseGapNumber()` mengeluarkan nomor dalam range `gap_start–gap_end` (untuk request gap yang disetujui admin).
- Jika nomor berikutnya jatuh di zona gap, sistem otomatis melompat ke `aktif_start` blok berikutnya.
- Nomor gap **hanya bisa diterbitkan** melalui proses persetujuan admin (`POST /api/gap-requests` → `PATCH /api/gap-requests/{id}/approve`).

---

## Scheduled Job

```bash
php artisan schedule:run   # jalankan setiap menit via cron
```

Job `CalculateNextDaySequence` berjalan tiap malam **23:55** untuk menyiapkan nomor hari berikutnya secara otomatis.

**Konfigurasi cron (Linux/server):**
```cron
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

---

## Testing

```bash
php artisan test
```

Suite mencakup: AuthTest, NumberingServiceTest, GapRequestTest, LetterNumberTest, dan ConcurrencyTest.

---

## Endpoint Utama

### 🔐 Auth (`/api/auth`)
| Method | Endpoint                    | Middleware      | Deskripsi              |
|--------|-----------------------------|-----------------|------------------------|
| POST   | `/api/auth/login`           | -               | Login, dapat token     |
| POST   | `/api/auth/logout`          | auth, active    | Logout (revoke token)  |
| GET    | `/api/auth/me`              | auth, active    | Profil user login      |
| POST   | `/api/auth/change-password` | auth, active    | Ganti password         |

### 👤 Users (`/api/users`) — Admin only
| Method | Endpoint                      | Deskripsi                  |
|--------|-------------------------------|----------------------------|
| GET    | `/api/users`                  | Daftar semua user          |
| POST   | `/api/users`                  | Buat user baru             |
| GET    | `/api/users/{id}`             | Detail user                |
| PUT    | `/api/users/{id}`             | Update user                |
| PATCH  | `/api/users/{id}/toggle-active` | Aktifkan/nonaktifkan user |

### 📂 Klasifikasi Surat (`/api/classifications`)
| Method | Endpoint                               | Middleware   | Deskripsi                     |
|--------|----------------------------------------|--------------|-------------------------------|
| GET    | `/api/classifications`                 | auth, active | Daftar klasifikasi            |
| POST   | `/api/classifications`                 | auth, active, admin | Buat klasifikasi       |
| GET    | `/api/classifications/{id}`            | auth, active | Detail klasifikasi            |
| PUT    | `/api/classifications/{id}`            | auth, active, admin | Update klasifikasi     |
| GET    | `/api/classifications/{id}/children`   | auth, active | Sub-klasifikasi               |
| PATCH  | `/api/classifications/{id}/toggle-active` | auth, active, admin | Toggle aktif |

### 📋 Nomor Surat (`/api/letters`)
| Method | Endpoint               | Middleware   | Deskripsi                    |
|--------|------------------------|--------------|------------------------------|
| GET    | `/api/letters`         | auth, active | Surat milik user login       |
| POST   | `/api/letters`         | auth, active | Request nomor surat baru     |
| GET    | `/api/letters/all`     | auth, active, admin | Semua surat (admin)   |
| GET    | `/api/letters/{id}`    | auth, active | Detail surat                 |
| PATCH  | `/api/letters/{id}/void` | auth, active | Void/batalkan surat         |

### 📦 Gap Request (`/api/gap-requests`)
| Method | Endpoint                          | Middleware   | Deskripsi                          |
|--------|-----------------------------------|--------------|------------------------------------|
| GET    | `/api/gap-requests`               | auth, active | Gap request milik user login       |
| POST   | `/api/gap-requests`               | auth, active | Ajukan gap request                 |
| GET    | `/api/gap-requests/all`           | auth, active, admin | Semua gap request (admin)   |
| PATCH  | `/api/gap-requests/{id}/approve`  | auth, active, admin | Setujui gap request         |
| PATCH  | `/api/gap-requests/{id}/reject`   | auth, active, admin | Tolak gap request           |

### 📅 Daily Sequence (`/api/sequences`)
| Method | Endpoint                 | Middleware   | Deskripsi                          |
|--------|--------------------------|--------------|------------------------------------|
| GET    | `/api/sequences`         | auth, active, admin | Daftar sequence               |
| GET    | `/api/sequences/today`   | auth, active | Sequence hari ini                  |
| PATCH  | `/api/sequences/gap`     | auth, active, admin | Update gap_size               |

### 📊 Laporan (`/api/reports`) — Admin only
| Method | Endpoint                | Deskripsi                     |
|--------|-------------------------|-------------------------------|
| GET    | `/api/reports/summary`  | Ringkasan statistik surat     |
| GET    | `/api/reports/export`   | Ekspor data surat (CSV/JSON)  |

### 🔍 Audit Log (`/api/audit-logs`) — Admin only
| Method | Endpoint                 | Deskripsi           |
|--------|--------------------------|---------------------|
| GET    | `/api/audit-logs`        | Daftar audit log    |
| GET    | `/api/audit-logs/{id}`   | Detail audit log    |

---

## Penanganan Error

| Kondisi                         | HTTP Status | Exception                  |
|---------------------------------|-------------|----------------------------|
| Lock timeout / deadlock         | 409         | `NumberingLockException`   |
| Nomor gap sudah digunakan       | 422         | `GapAlreadyUsedException`  |
| User nonaktif                   | 403         | `EnsureUserIsActive`       |
| Validasi gagal                  | 422         | Laravel Form Request       |
| Unauthorized                    | 401         | Sanctum                    |

---

## Stack Teknologi

- **Backend:** Laravel (latest stable) + Laravel Sanctum
- **Database:** MySQL
- **Pattern:** Service Layer, Form Request, API Resource, Observer
- **Auth:** Bearer Token via Sanctum
- **Response:** JSON `{ data, message, meta }` — `meta` hanya jika paginated
