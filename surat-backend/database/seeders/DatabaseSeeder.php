<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Urutan seed wajib diperhatikan karena ada dependency antar tabel:
     *   1. AdminSeeder             → insert user admin (tidak bergantung apapun)
     *   2. LetterClassificationSeeder → insert klasifikasi surat (tidak bergantung user)
     *   3. DailySequenceSeeder     → verifikasi config saja, tabel dibiarkan kosong
     */
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            LetterClassificationSeeder::class,
            DailySequenceSeeder::class,
        ]);
    }
}
