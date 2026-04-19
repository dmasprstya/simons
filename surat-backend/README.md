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

## Cara Kerja Penomoran (Linear Daily Gap)

Sistem menggunakan alur penomoran **Linear** yang diselingi oleh **Gap** setiap kali terjadi pergantian hari (rollover).

### Konsep Inti:
1.  **Pengambilan Nomor**: Nomor diterbitkan secara berurutan (`last_number + 1`).
2.  **Rollover (Ganti Hari)**: Saat pengambilan nomor pertama di hari baru:
    -   Sistem melompati nomor cadangan sebanyak `gap_size`.
    -   Nomor yang dilompati diarsipkan ke tabel `daily_gaps` (sebagai zona gap hari sebelumnya).
    -   Nomor baru hari ini dimulai setelah zona gap tersebut.

### Visualisasi (gap_size=10, last_number_senin=1076):
- **Selasa**: Nomor pertama adalah **1087** (1077-1086 masuk gap Senin).
- **Rabu**: Jika Selasa terakhir 1102, maka nomor pertama Rabu adalah **1113** (1103-1112 masuk gap Selasa).

### Aturan:
- `acquireNumber()`: Mengambil nomor berurutan + otomatis rollover.
- `releaseGapNumber()`: Menerbitkan nomor dari `daily_gaps` (khusus request gap).
- Pessimistic locking digunakan untuk mencegah nomor ganda.

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
| GET    | `/api/reports/export`   | Ekspor data surat (PDF/CSV/JSON) |

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
