<?php

return [
    'action' => [
        // Letter Actions
        'letter_created' => 'Surat Dibuat',
        'letter_create' => 'Surat Dibuat',
        'letter_voided' => 'Surat Dibatalkan',
        'letter_updated' => 'Detail Surat Diperbarui',
        
        // Gap Actions
        'gap_approved' => 'Gap Disetujui',
        'gap_rejected' => 'Gap Ditolak',
        'gap_requested' => 'Gap Diminta',
        'gap_request_created' => 'Permintaan Gap Diajukan',
        'gap_request_status_changed' => 'Status Gap Diubah',
        
        // User Actions
        'user_created' => 'User Dibuat',
        'user_create' => 'User Dibuat',
        'user_updated' => 'User Diperbarui',
        'user_update' => 'User Diperbarui',
        'user_deleted' => 'User Dihapus',
        'user_delete' => 'User Dihapus',
        'user_toggled' => 'Status User Diubah',
        'user_toggle_active' => 'Status User Diubah',
        'user_change_password' => 'Password User Diubah',
        
        // Profile Actions
        'profile_update' => 'Profil Diperbarui',
        'profile_change_password' => 'Password Profil Diubah',
        'profile_photo_upload' => 'Foto Profil Diunggah',
        'profile_photo_delete' => 'Foto Profil Dihapus',
        
        // Classification Actions
        'classification_created' => 'Klasifikasi Dibuat',
        'classification_create' => 'Klasifikasi Dibuat',
        'classification_updated' => 'Klasifikasi Diperbarui',
        'classification_update' => 'Klasifikasi Diperbarui',
        'classification_toggled' => 'Status Klasifikasi Diubah',
        'classification_toggle_active' => 'Status Klasifikasi Diubah',
        'classification_deleted' => 'Klasifikasi Dihapus',
        'classification_delete' => 'Klasifikasi Dihapus',
        'classification_restored' => 'Klasifikasi Dipulihkan',
        
        // Other Actions
        'sequence_updated' => 'Sequence Diperbarui',
        'report_exported' => 'Laporan Diekspor',
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
