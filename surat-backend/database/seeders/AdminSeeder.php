<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Seed user administrator default.
     * Menggunakan updateOrCreate agar aman dijalankan ulang (idempoten).
     * Email unik digunakan sebagai kunci pencarian.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@surat.local'],
            [
                'name'      => 'Administrator',
                'nip'       => 'ADM-0001',
                'password'  => bcrypt('password'),
                'work_unit' => 'Bagian TUM',
                'role'      => 'admin',
                'is_active' => true,
            ]
        );

        $this->command->info('AdminSeeder: user admin@surat.local berhasil dibuat/diperbarui.');
    }
}
