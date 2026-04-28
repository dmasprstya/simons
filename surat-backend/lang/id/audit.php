<?php

return [
    'action' => [
        // Letter Actions (from LetterNumberObserver)
        'letter' => [
            'created' => 'Surat Dibuat',
            'updated' => 'Detail Surat Diperbarui',
            'voided' => 'Surat Dibatalkan',
        ],

        // Gap Actions (from GapRequestService & Controller)
        'gap' => [
            'approved' => 'Gap Disetujui',
            'rejected' => 'Gap Ditolak',
            'requested' => 'Gap Diminta',
            'created' => 'Permintaan Gap Diajukan', // gap_request.created
        ],

        'gap_request' => [
            'created' => 'Permintaan Gap Diajukan',
            'status_changed' => 'Status Gap Diubah',
        ],

        // User Actions (from UserController)
        'user' => [
            'create' => 'User Dibuat',
            'created' => 'User Dibuat',
            'update' => 'User Diperbarui',
            'updated' => 'User Diperbarui',
            'delete' => 'User Dihapus',
            'deleted' => 'User Dihapus',
            'toggle_active' => 'Status User Diubah',
            'change_password' => 'Password User Direset',
            'status_changed' => 'Status User Diubah',
            'password_changed' => 'Password User Direset',
        ],

        // Profile Actions (from ProfileController)
        'profile' => [
            'update' => 'Profil Diperbarui',
            'change_password' => 'Password Profil Diubah',
            'photo_upload' => 'Foto Profil Diunggah',
            'photo_delete' => 'Foto Profil Dihapus',
            'avatar_uploaded' => 'Foto Profil Diunggah',
            'avatar_deleted' => 'Foto Profil Dihapus',
        ],

        // Classification Actions (from LetterClassificationController)
        'classification' => [
            'create' => 'Klasifikasi Dibuat',
            'created' => 'Klasifikasi Dibuat',
            'update' => 'Klasifikasi Diperbarui',
            'updated' => 'Klasifikasi Diperbarui',
            'delete' => 'Klasifikasi Dihapus',
            'deleted' => 'Klasifikasi Dihapus',
            'toggle_active' => 'Status Klasifikasi Diubah',
            'restore' => 'Klasifikasi Dipulihkan',
        ],

        // Other Actions
        'sequence' => [
            'updated' => 'Sequence Diperbarui',
        ],
        'report' => [
            'exported' => 'Laporan Diekspor',
        ],
        'auth' => [
            'login' => 'Masuk',
            'logout' => 'Keluar',
        ],

        // Fallbacks for underscore keys (if any)
        'letter_created' => 'Surat Dibuat',
        'letter_updated' => 'Detail Surat Diperbarui',
        'gap_approved' => 'Gap Disetujui',
        'gap_rejected' => 'Gap Ditolak',
        'user_created' => 'User Dibuat',
        'auth_login' => 'Masuk',
        'auth_logout' => 'Keluar',
    ],

    'table' => [
        'letter_numbers' => 'Nomor Surat',
        'gap_requests' => 'Permintaan Gap',
        'users' => 'Pengguna',
        'letter_classifications' => 'Klasifikasi Surat',
        'global_sequences' => 'Urutan Global',
    ],

    'field' => [
        'subject' => 'Perihal',
        'destination' => 'Tujuan',
        'number' => 'Nomor',
        'status' => 'Status',
        'name' => 'Nama',
        'email' => 'Email',
        'work_unit' => 'Unit Kerja',
        'role' => 'Role',
        'is_active' => 'Aktif',
        'code' => 'Kode',
        'description' => 'Deskripsi',
        'reason' => 'Alasan',
        'rejection_reason' => 'Alasan Penolakan',
        'last_number' => 'Nomor Terakhir',
        'gap_size' => 'Ukuran Gap',
        'classification_id' => 'Klasifikasi',
        'letter_nature' => 'Sifat Surat',
        'formatted_number' => 'Nomor Terformat',
        'photo_path' => 'Foto Profil',
        'password' => 'Password',
        'year' => 'Tahun',
        'month' => 'Bulan',
        'sequence' => 'Urutan',
        'last_issued_date' => 'Tanggal Terbit Terakhir',
        'gap_start' => 'Awal Gap',
        'gap_end' => 'Akhir Gap',
        'gap_date' => 'Tanggal Gap',
        'id' => 'ID',
        'user_id' => 'ID Pengguna',
        'created_at' => 'Waktu Dibuat',
        'updated_at' => 'Waktu Diperbarui',
    ],

    'status' => [
        'pending' => 'Menunggu',
        'approved' => 'Disetujui',
        'rejected' => 'Ditolak',
        'active' => 'Aktif',
        'inactive' => 'Nonaktif',
        'voided' => 'Dibatalkan',
    ],
];
