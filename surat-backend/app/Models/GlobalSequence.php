<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GlobalSequence extends Model
{
    protected $table = 'global_sequence';

    const CREATED_AT = null;
    const UPDATED_AT = 'updated_at';

    protected $fillable = ['last_number', 'next_start', 'gap_size'];

    protected function casts(): array
    {
        return [
            'last_number' => 'integer',
            'next_start'  => 'integer',
            'gap_size'    => 'integer',
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
            'next_start'  => config('numbering.default_start', 1000),
            'gap_size'    => config('numbering.default_gap_size', 10),
        ]);
    }
}
