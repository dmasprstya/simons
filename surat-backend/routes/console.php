<?php

use App\Jobs\CalculateNextDaySequence;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Jadwalkan kalkulasi sequence hari berikutnya setiap malam pukul 23:55.
// Job hanya memproses DailySequence yang pernah digunakan hari ini (last_number > 0)
// sehingga sequence kosong tidak membebani antrian.
Schedule::job(CalculateNextDaySequence::class)->dailyAt('23:55');
