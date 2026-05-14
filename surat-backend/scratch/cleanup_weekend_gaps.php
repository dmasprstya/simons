<?php

use App\Models\DailyGap;
use App\Models\GapRequest;
use App\Models\LetterNumber;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$satSunGaps = DailyGap::all()->filter(function ($gap) {
    return $gap->date->isSaturday() || $gap->date->isSunday();
});

echo "Found " . $satSunGaps->count() . " DailyGap records on Saturday/Sunday.\n";

foreach ($satSunGaps as $gap) {
    echo "Processing gap for date: " . $gap->date->toDateString() . " (" . $gap->gap_start . "-" . $gap->gap_end . ")\n";
    
    // Check if any numbers in this range are used
    $usedInLetters = LetterNumber::whereBetween('number', [$gap->gap_start, $gap->gap_end])->count();
    $usedInRequests = GapRequest::whereBetween('number', [$gap->gap_start, $gap->gap_end])->count();
    
    if ($usedInLetters > 0 || $usedInRequests > 0) {
        echo "  WARNING: " . $usedInLetters . " letters and " . $usedInRequests . " requests found in this gap range. Skipping delete.\n";
    } else {
        echo "  Deleting DailyGap record.\n";
        $gap->delete();
    }
}

echo "Cleanup finished.\n";
