<?php

namespace App\Http\Controllers;

use App\Models\DailyGap;
use App\Models\GapRequest;
use App\Models\LetterNumber;
use App\Services\NumberingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GapNumberController extends Controller
{
    public function __construct(
        private readonly NumberingService $numberingService,
    ) {}

    /**
     * Daftar nomor kosong (vacant) yang tersedia di zona gap setiap hari.
     *
     * Alur:
     *   1. Ambil semua baris DailyGap, opsional difilter berdasarkan date_from/date_to.
     *   2. Pluck dua himpunan eksklusif dalam satu query masing-masing:
     *        a. Nomor yang sudah diterbitkan sebagai LetterNumber (letter_numbers.number)
     *        b. Nomor yang sedang dalam gap_request berstatus 'pending' atau 'approved'
     *   3. Ekspansi range gap_start..gap_end per baris menjadi daftar nomor individual,
     *      lalu buang nomor yang ada di salah satu himpunan eksklusif.
     *   4. Paginasi manual atas daftar flat tersebut (50 per halaman).
     *
     * Performance note:
     *   Himpunan eksklusif di-pluck sekali sebelum loop — tidak ada subquery per-nomor.
     *   Pengecekan keanggotaan dilakukan via PHP in_array() pada array integer.
     *
     * @param  Request  $request  Parameter filter: date_from, date_to, page
     * @return JsonResponse       { data: [{number, date, gap_start, gap_end}], message, meta }
     */
    public function index(Request $request): JsonResponse
    {
        // Pastikan zona gap hari sebelumnya sudah diarsipkan meski belum ada surat baru hari ini.
        // Ini menangani kasus: pergantian hari, server sempat mati, atau pertama kali dibuka pagi hari.
        $this->numberingService->ensureDayIsCurrent();

        // ─── 1. Bangun query DailyGap dengan filter tanggal opsional ────────
        $query = DailyGap::query()->orderBy('date');

        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        /** @var \Illuminate\Database\Eloquent\Collection<DailyGap> $dailyGaps */
        $dailyGaps = $query->get();

        // ─── 2. Bangun himpunan eksklusif via pluck (sekali per set) ────────

        // a. Nomor yang sudah diterbitkan sebagai surat resmi
        $usedInLetters = LetterNumber::pluck('number')->all();

        // b. Nomor yang sedang diajukan atau sudah disetujui via gap request
        $usedInRequests = GapRequest::whereIn('status', ['pending', 'approved'])
            ->whereNotNull('number')
            ->pluck('number')
            ->all();

        // Gabung kedua himpunan menjadi satu array integer untuk pengecekan O(1) via flip
        $excluded = array_flip(
            array_merge($usedInLetters, $usedInRequests)
        );

        // ─── 3. Ekspansi range dan filter nomor yang sudah terpakai ─────────
        $vacantNumbers = [];

        foreach ($dailyGaps as $gap) {
            $dateString = $gap->date->toDateString(); // "YYYY-MM-DD"

            for ($n = $gap->gap_start; $n <= $gap->gap_end; $n++) {
                if (isset($excluded[$n])) {
                    // Nomor sudah dipakai — lewati
                    continue;
                }

                $vacantNumbers[] = [
                    'number'    => $n,
                    'date'      => $dateString,
                    'gap_start' => $gap->gap_start,
                    'gap_end'   => $gap->gap_end,
                ];
            }
        }

        // ─── 4. Paginasi manual ──────────────────────────────────────────────
        $perPage     = 50;
        $total       = count($vacantNumbers);
        $currentPage = max(1, (int) $request->query('page', 1));
        $offset      = ($currentPage - 1) * $perPage;
        $lastPage    = (int) ceil($total / $perPage) ?: 1;

        $pageItems = array_slice($vacantNumbers, $offset, $perPage);

        return response()->json([
            'data'    => $pageItems,
            'message' => 'Daftar nomor gap kosong berhasil diambil.',
            'meta'    => [
                'current_page' => $currentPage,
                'last_page'    => $lastPage,
                'per_page'     => $perPage,
                'total'        => $total,
            ],
        ]);
    }
}
