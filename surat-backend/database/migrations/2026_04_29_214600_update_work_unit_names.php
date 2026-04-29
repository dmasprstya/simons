<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $mappings = [
            'Bidang P3H'  => 'Divisi Peraturan Perundangan-undangan dan Pembinaan Hukum',
            'Layanan AHU' => 'Bidang Pelayanan Administrasi Hukum Umum',
            'Layanan KI'  => 'Bidang Pelayanan Kekayaan Intelektual',
            'Bagian TUM'  => 'Bagian Tata Usaha dan Umum',
        ];

        foreach ($mappings as $old => $new) {
            DB::table('users')
                ->where('work_unit', $old)
                ->update(['work_unit' => $new]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $mappings = [
            'Divisi Peraturan Perundangan-undangan dan Pembinaan Hukum' => 'Bidang P3H',
            'Bidang Pelayanan Administrasi Hukum Umum'                 => 'Layanan AHU',
            'Bidang Pelayanan Kekayaan Intelektual'                     => 'Layanan KI',
            'Bagian Tata Usaha dan Umum'                                => 'Bagian TUM',
        ];

        foreach ($mappings as $new => $old) {
            DB::table('users')
                ->where('work_unit', $new)
                ->update(['work_unit' => $old]);
        }
    }
};
