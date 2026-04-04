<?php

namespace Database\Seeders;

use App\Models\LetterClassification;
use Illuminate\Database\Seeder;

class LetterClassificationSeeder extends Seeder
{
    /**
     * Seed data klasifikasi surat berdasarkan Permenkumham No. 5 Tahun 2022.
     *
     * Struktur hierarki 3 level:
     *   Level 1 = Root / kategori utama (code: "HM", "TU", dst.)
     *   Level 2 = Sub-kategori  (code: "HM.01", "TU.01", dst.)
     *   Level 3 = Leaf (is_leaf = true) — yang dipakai untuk penomoran surat
     *
     * Tipe:
     *   substantif  → bidang hukum / fungsi utama instansi
     *   fasilitatif → administrasi dan dukungan umum
     *
     * Menggunakan firstOrCreate agar aman dijalankan ulang.
     * Setelah semua insert selesai, is_leaf di-update secara otomatis
     * berdasarkan node mana yang tidak memiliki children.
     */
    public function run(): void
    {
        // ─────────────────────────────────────────────────────────
        // Definisi data hierarki lengkap
        // Format: [ code, name, type, level, parent_code ]
        // parent_code = null untuk root (level 1)
        // ─────────────────────────────────────────────────────────
        $classifications = [

            // ── ROOT 1: HM – Hukum dan Perundang-undangan (substantif) ──
            ['HM',       'Hukum dan Perundang-undangan', 'substantif',  1, null],

                // Level 2
                ['HM.01',    'Peraturan Perundang-undangan', 'substantif', 2, 'HM'],
                    ['HM.01.01', 'Penyusunan Peraturan',         'substantif', 3, 'HM.01'],
                    ['HM.01.02', 'Evaluasi Peraturan',           'substantif', 3, 'HM.01'],

                ['HM.02',    'Bantuan Hukum',               'substantif', 2, 'HM'],
                    ['HM.02.01', 'Konsultasi Hukum',            'substantif', 3, 'HM.02'],
                    ['HM.02.02', 'Litigasi dan Perwakilan',     'substantif', 3, 'HM.02'],

                ['HM.03',    'Penyuluhan Hukum',            'substantif', 2, 'HM'],
                    ['HM.03.01', 'Penyuluhan Langsung',         'substantif', 3, 'HM.03'],
                    ['HM.03.02', 'Penyuluhan Media',            'substantif', 3, 'HM.03'],

            // ── ROOT 2: TU – Tata Usaha (fasilitatif) ──
            ['TU',       'Tata Usaha',                      'fasilitatif', 1, null],

                ['TU.01',    'Surat Menyurat',               'fasilitatif', 2, 'TU'],
                    ['TU.01.01', 'Surat Keluar',                 'fasilitatif', 3, 'TU.01'],
                    ['TU.01.02', 'Surat Masuk',                  'fasilitatif', 3, 'TU.01'],

                ['TU.02',    'Kearsipan',                   'fasilitatif', 2, 'TU'],
                    ['TU.02.01', 'Penyimpanan Arsip',            'fasilitatif', 3, 'TU.02'],
                    ['TU.02.02', 'Pemusnahan Arsip',             'fasilitatif', 3, 'TU.02'],

                ['TU.03',    'Protokol dan Hubungan Masyarakat', 'fasilitatif', 2, 'TU'],
                    ['TU.03.01', 'Keprotokolan',                 'fasilitatif', 3, 'TU.03'],

            // ── ROOT 3: KP – Kepegawaian (fasilitatif) ──
            ['KP',       'Kepegawaian',                     'fasilitatif', 1, null],

                ['KP.01',    'Pengadaan Pegawai',            'fasilitatif', 2, 'KP'],
                    ['KP.01.01', 'Rekrutmen dan Seleksi',        'fasilitatif', 3, 'KP.01'],
                    ['KP.01.02', 'Pengangkatan CPNS',            'fasilitatif', 3, 'KP.01'],

                ['KP.02',    'Pengembangan Pegawai',         'fasilitatif', 2, 'KP'],
                    ['KP.02.01', 'Pendidikan dan Pelatihan',     'fasilitatif', 3, 'KP.02'],
                    ['KP.02.02', 'Penilaian Kinerja',           'fasilitatif', 3, 'KP.02'],

                ['KP.03',    'Pemberhentian Pegawai',        'fasilitatif', 2, 'KP'],
                    ['KP.03.01', 'Pensiun',                     'fasilitatif', 3, 'KP.03'],
                    ['KP.03.02', 'Pemberhentian dengan Hormat', 'fasilitatif', 3, 'KP.03'],

            // ── ROOT 4: KU – Keuangan (fasilitatif) ──
            ['KU',       'Keuangan',                        'fasilitatif', 1, null],

                ['KU.01',    'Penyusunan Anggaran',          'fasilitatif', 2, 'KU'],
                    ['KU.01.01', 'Rencana Kerja Anggaran',       'fasilitatif', 3, 'KU.01'],
                    ['KU.01.02', 'Revisi Anggaran',              'fasilitatif', 3, 'KU.01'],

                ['KU.02',    'Pelaksanaan Anggaran',         'fasilitatif', 2, 'KU'],
                    ['KU.02.01', 'Pembayaran dan Pengeluaran',   'fasilitatif', 3, 'KU.02'],
                    ['KU.02.02', 'Pertanggungjawaban Keuangan',  'fasilitatif', 3, 'KU.02'],

                ['KU.03',    'Akuntansi dan Pelaporan',      'fasilitatif', 2, 'KU'],
                    ['KU.03.01', 'Laporan Keuangan Bulanan',     'fasilitatif', 3, 'KU.03'],
                    ['KU.03.02', 'Laporan Keuangan Tahunan',     'fasilitatif', 3, 'KU.03'],

            // ── ROOT 5: OR – Organisasi dan Tata Laksana (substantif) ──
            ['OR',       'Organisasi dan Tata Laksana',     'substantif',  1, null],

                ['OR.01',    'Kelembagaan',                  'substantif', 2, 'OR'],
                    ['OR.01.01', 'Pembentukan Unit Kerja',        'substantif', 3, 'OR.01'],
                    ['OR.01.02', 'Evaluasi Kelembagaan',         'substantif', 3, 'OR.01'],

                ['OR.02',    'Ketatalaksanaan',              'substantif', 2, 'OR'],
                    ['OR.02.01', 'Standar Operasional Prosedur',  'substantif', 3, 'OR.02'],
                    ['OR.02.02', 'Analisis Jabatan',              'substantif', 3, 'OR.02'],

                ['OR.03',    'Reformasi Birokrasi',          'substantif', 2, 'OR'],
                    ['OR.03.01', 'Perencanaan Reformasi',         'substantif', 3, 'OR.03'],
                    ['OR.03.02', 'Evaluasi dan Pelaporan',        'substantif', 3, 'OR.03'],
        ];

        // ─────────────────────────────────────────────────────────
        // Insert / lookup berurutan level 1 → 2 → 3
        // Map code → id disimpan agar bisa di-resolve parent_id
        // ─────────────────────────────────────────────────────────
        /** @var array<string, int> $codeToId */
        $codeToId = [];

        foreach ($classifications as [$code, $name, $type, $level, $parentCode]) {
            $parentId = $parentCode !== null ? ($codeToId[$parentCode] ?? null) : null;

            $record = LetterClassification::firstOrCreate(
                ['code' => $code],
                [
                    'parent_id' => $parentId,
                    'level'     => $level,
                    'name'      => $name,
                    'type'      => $type,
                    'is_leaf'   => false, // akan dikoreksi setelah semua insert
                    'is_active' => true,
                ]
            );

            $codeToId[$code] = $record->id;
        }

        // ─────────────────────────────────────────────────────────
        // Koreksi is_leaf:
        //   - Set TRUE untuk semua node yang tidak mempunyai children
        //   - Set FALSE untuk semua node yang mempunyai children
        // Dilakukan lewat subquery agar satu query saja (efisien).
        // ─────────────────────────────────────────────────────────

        // Ambil semua id yang menjadi parent (punya anak)
        $parentIds = LetterClassification::whereNotNull('parent_id')
            ->distinct()
            ->pluck('parent_id')
            ->toArray();

        // Tandai node yang punya anak → is_leaf = false
        if (!empty($parentIds)) {
            LetterClassification::whereIn('id', $parentIds)
                ->update(['is_leaf' => false]);
        }

        // Tandai node yang tidak punya anak → is_leaf = true
        LetterClassification::whereNotIn('id', $parentIds)
            ->update(['is_leaf' => true]);

        $totalLeaf = LetterClassification::where('is_leaf', true)->count();
        $total     = LetterClassification::count();

        $this->command->info("LetterClassificationSeeder: {$total} klasifikasi dimuat, {$totalLeaf} leaf.");
    }
}
