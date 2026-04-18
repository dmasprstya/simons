# Konteks Project: Sistem Penomoran Surat

## Stack
- Backend: Laravel (versi terbaru stabil) + Laravel Sanctum
- Database: MySQL
- Pattern: Service layer, Form Request, API Resource, Observer

## Aturan Wajib
- Semua response API: JSON `{ data, message, meta }` — meta hanya jika paginated
- Auth: Bearer token via Sanctum
- Gunakan type hints & return types di semua method
- Setiap aksi penting dicatat ke audit_logs via AuditService
- Gunakan DB::transaction untuk operasi yang melibatkan multiple tabel
- Jangan hapus komentar penjelasan logika bisnis
- DILARANG membuka browser, menjalankan dev server, atau menggunakan preview untuk testing
- Semua testing HANYA via: `php artisan test`, `php artisan route:list`, `php artisan migrate:status`
- Setelah selesai tiap fase: tampilkan checklist file yang dibuat/diubah, tunggu konfirmasi eksplisit sebelum lanjut

## Logika Gap — Baca Sebelum Menyentuh NumberingService

### Konsep Inti
Nomor aktif dalam satu hari **tidak dibatasi**. Gap (loncatan nomor) hanya terjadi **sekali saat hari berganti**.

### Contoh Konkret (default_start=1000, gap_size=10)
```
Senin   → nomor aktif: 1000, 1001, 1002, ... (tidak terbatas sepanjang hari)
           misalnya hari ini terakhir: 1076

Rollover terjadi saat pertama kali ambil nomor hari Selasa:
  → arsipkan cadangan Senin: 1077–1086 → masuk tabel daily_gaps (date=Senin)
  → nomor pertama Selasa: 1087

Selasa  → nomor aktif: 1087, 1088, 1089, ... (tidak terbatas)
           misalnya hari ini terakhir: 1102

Rollover ke Rabu:
  → arsipkan cadangan Selasa: 1103–1112 → masuk tabel daily_gaps (date=Selasa)
  → nomor pertama Rabu: 1113
```

### Struktur GlobalSequence
| Kolom | Keterangan |
|---|---|
| `last_number` | Nomor terakhir yang diterbitkan (absolut, bukan offset) |
| `gap_size` | Jumlah nomor cadangan yang di-skip saat ganti hari |
| `last_issued_date` | Tanggal terakhir nomor diterbitkan |

> `next_start` sudah dihapus — tidak digunakan lagi.

### Logika acquireNumber()
```
1. Lock GlobalSequence (FOR UPDATE)
2. Jika last_issued_date BUKAN hari ini (ganti hari):
   - gap_start = last_number + 1
   - gap_end   = last_number + gap_size
   - Arsipkan ke daily_gaps: { date=last_issued_date, gap_start, gap_end }
   - candidate = last_number + gap_size + 1
3. Jika last_issued_date = hari ini (hari sama):
   - candidate = last_number + 1
4. Update last_number = candidate, last_issued_date = today()
5. Return candidate
```

### Logika releaseGapNumber()
Nomor gap yang di-approve via GapRequest diterbitkan dengan validasi:
1. Nomor harus ada di tabel `daily_gaps` untuk `gap_date` yang diminta (cek `gap_start <= number <= gap_end`)
2. Nomor belum ada di tabel `letter_numbers`

> Tidak ada kalkulasi posInBlock atau blockIndex — validasi cukup via tabel daily_gaps.

### Logika ensureDayIsCurrent()
Dipanggil controller saat halaman dibuka (tanpa menerbitkan nomor baru):
```
1. Lock GlobalSequence
2. Jika last_issued_date null atau sudah hari ini → return (tidak perlu rollover)
3. Arsipkan gap: { date=last_issued_date, gap_start=last_number+1, gap_end=last_number+gap_size }
4. Update last_issued_date = today() (last_number tidak berubah)
```

## Penanganan Error Kritis
- Lock timeout / deadlock di NumberingService → throw NumberingLockException → controller return 409
- Nomor gap sudah dipakai / tidak valid → throw GapAlreadyUsedException → controller return 422
- User nonaktif → middleware return 403