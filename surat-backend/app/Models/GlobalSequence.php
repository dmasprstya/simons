<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int                                  $id
 * @property int                                  $last_number  Nomor absolut terakhir yang diterbitkan (0 = belum ada)
 * @property int                                  $gap_size
 * @property \Illuminate\Support\Carbon|null       $last_issued_date
 * @property \Illuminate\Support\Carbon|null       $updated_at
 */
class GlobalSequence extends Model
{
    protected $table = 'global_sequence';

    const CREATED_AT = null;
    const UPDATED_AT = 'updated_at';

    protected $fillable = ['last_number', 'gap_size', 'last_issued_date'];

    protected function casts(): array
    {
        return [
            'last_number' => 'integer',
            'gap_size'    => 'integer',
            'last_issued_date' => 'date',
        ];
    }

    /**
     * Selalu ambil satu-satunya baris di tabel ini.
     * Jika belum ada (fresh install), buat dengan nilai dari config.
     */
    public static function getInstance(): self
    {
        return static::firstOrCreate([], [
            'last_number' => 0,
            'gap_size'    => config('numbering.default_gap_size', 10),
        ]);
    }
}
