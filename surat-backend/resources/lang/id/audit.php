<?php

return [
    'action' => [
        // Letter Actions
        'letter.created' => 'Surat Dibuat',
        'letter.create' => 'Surat Dibuat',
        'letter.voided' => 'Surat Dibatalkan',
        'letter.updated' => 'Detail Surat Diperbarui',
        
        // Gap Actions
        'gap.approved' => 'Gap Disetujui',
        'gap.rejected' => 'Gap Ditolak',
        'gap.requested' => 'Gap Diminta',
        'gap_request.created' => 'Permintaan Gap Diajukan',
        'gap_request.status_changed' => 'Status Gap Diubah',
        
        // User Actions
        'user.created' => 'User Dibuat',
        'user.create' => 'User Dibuat',
        'user.updated' => 'User Diperbarui',
        'user.update' => 'User Diperbarui',
        'user.deleted' => 'User Dihapus',
        'user.delete' => 'User Dihapus',
        'user.toggled' => 'Status User Diubah',
        'user.toggle_active' => 'Status User Diubah',
        'user.change_password' => 'Password User Diubah',
        
        // Profile Actions
        'profile.update' => 'Profil Diperbarui',
        'profile.change_password' => 'Password Profil Diubah',
        'profile.photo_upload' => 'Foto Profil Diunggah',
        'profile.photo_delete' => 'Foto Profil Dihapus',
        
        // Classification Actions
        'classification.created' => 'Klasifikasi Dibuat',
        'classification.create' => 'Klasifikasi Dibuat',
        'classification.updated' => 'Klasifikasi Diperbarui',
        'classification.update' => 'Klasifikasi Diperbarui',
        'classification.toggled' => 'Status Klasifikasi Diubah',
        'classification.toggle_active' => 'Status Klasifikasi Diubah',
        'classification.deleted' => 'Klasifikasi Dihapus',
        'classification.delete' => 'Klasifikasi Dihapus',
        'classification.restored' => 'Klasifikasi Dipulihkan',
        
        // Other Actions
        'sequence.updated' => 'Sequence Diperbarui',
        'report.exported' => 'Laporan Diekspor',
        'auth.login' => 'Masuk',
        'auth.logout' => 'Keluar',
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
        'formatted_number' => 'Nomor Terformat',
        'photo_path' => 'Foto Profil',
        'password' => 'Password',
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
