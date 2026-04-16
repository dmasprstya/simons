<?php

namespace App\Console\Commands;

use App\Models\LetterClassification;
use Illuminate\Console\Command;

class FixClassificationIsLeaf extends Command
{
    protected $signature   = 'classifications:fix-leaf';
    protected $description = 'Koreksi is_leaf pada semua klasifikasi berdasarkan relasi parent-child.';

    public function handle(): int
    {
        $parentIds = LetterClassification::whereNotNull('parent_id')
            ->distinct()
            ->pluck('parent_id')
            ->toArray();

        // Node yang punya anak → bukan leaf
        if (! empty($parentIds)) {
            LetterClassification::whereIn('id', $parentIds)->update(['is_leaf' => false]);
        }

        // Node yang tidak punya anak → leaf
        LetterClassification::whereNotIn('id', $parentIds)->update(['is_leaf' => true]);

        $leafCount  = LetterClassification::where('is_leaf', true)->count();
        $totalCount = LetterClassification::count();

        $this->info("Selesai. {$leafCount} leaf dari {$totalCount} total klasifikasi.");

        return self::SUCCESS;
    }
}
