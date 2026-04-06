<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DailySequenceResource extends JsonResource
{
    /**
     * Transformasi model DailySequence menjadi array representasi API.
     *
     * Computed fields menggunakan formula gap-block yang sama dengan NumberingService:
     *
     *   Formula untuk blok ke-N (N dihitung dari default_start):
     *     N                   = floor((last_number - default_start) / (gap_size * 2))
     *     aktif_start         = default_start + N * (gap_size * 2)
     *     aktif_end           = aktif_start + gap_size - 1
     *     gap_start           = aktif_end + 1
     *     gap_end             = gap_start + gap_size - 1
     *
     *   Catatan: default_start yang dimaksud = next_start di record ini,
     *   yaitu awal blok pertama untuk sequence ini (sesuai konfigurasi NumberingService).
     *   Karena DailySequence menyimpan last_number (nomor terakhir yang dibuatkan),
     *   blok aktif saat ini dihitung dari last_number.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // ── Hitung computed fields menggunakan formula gap-block ──────────────
        $lastNumber  = (int) $this->last_number;
        $gapSize     = (int) $this->gap_size;
        $nextStart   = (int) $this->next_start; // awal penomoran (default_start di AGENTS.md)

        // Hitung indeks blok ke-N (dimulai dari 0) berdasarkan last_number
        // Setiap blok mencakup gap_size * 2 nomor (aktif + cadangan)
        $blockSize = $gapSize * 2;
        $blockN    = $lastNumber > 0
            ? (int) floor(($lastNumber - $nextStart) / $blockSize)
            : 0;

        // Terapkan formula dari AGENTS.md
        $activeStart = $nextStart + $blockN * $blockSize;
        $activeEnd   = $activeStart + $gapSize - 1;
        $gapStart    = $activeEnd + 1;
        $gapEnd      = $gapStart + $gapSize - 1;

        return [
            'id'                => $this->id,
            'date'              => $this->date?->format('Y-m-d'),
            'classification_id' => $this->classification_id,
            'last_number'       => $this->last_number,
            'gap_size'          => $this->gap_size,
            'next_start'        => $this->next_start,
            'updated_at'        => $this->updated_at?->format('Y-m-d H:i'),

            // ── Computed fields berdasarkan formula gap-block ─────────────────
            'current_block_active_start' => $activeStart,
            'current_block_active_end'   => $activeEnd,
            'current_block_gap_start'    => $gapStart,
            'current_block_gap_end'      => $gapEnd,
        ];
    }
}
