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
Sistem membagi nomor surat menjadi blok. Setiap blok = gap_size nomor aktif + gap_size nomor cadangan (zona gap).

Contoh konkret (default_start=1000, gap_size=10):
- Blok 1 → aktif: 1000–1009 | zona gap: 1010–1019
- Blok 2 → aktif: 1020–1029 | zona gap: 1030–1039
- Blok 3 → aktif: 1040–1049 | zona gap: 1050–1059

Formula zona gap untuk blok ke-N (N dimulai dari 0):
  aktif_start = default_start + N * (gap_size * 2)
  aktif_end   = aktif_start + gap_size - 1
  gap_start   = aktif_end + 1
  gap_end     = gap_start + gap_size - 1

acquireNumber() hanya boleh mengeluarkan nomor dalam range aktif_start–aktif_end.
releaseGapNumber() mengeluarkan nomor dalam range gap_start–gap_end (untuk request gap yang diapprove).
Jika nomor berikutnya jatuh di zona gap, lompati ke aktif_start blok berikutnya.

## Penanganan Error Kritis
- Lock timeout / deadlock di NumberingService → throw NumberingLockException → controller return 409
- Nomor gap sudah dipakai → throw GapAlreadyUsedException → controller return 422
- User nonaktif → middleware return 403
