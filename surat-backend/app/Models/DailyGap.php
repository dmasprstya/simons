<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int                             $id
 * @property \Illuminate\Support\Carbon       $date
 * @property int                             $gap_start
 * @property int                             $gap_end
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class DailyGap extends Model
{
    protected $fillable = ['date', 'gap_start', 'gap_end'];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }
}
