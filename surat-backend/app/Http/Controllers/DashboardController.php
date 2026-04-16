<?php

namespace App\Http\Controllers;

use App\Http\Resources\AuditLogResource;
use App\Http\Resources\LetterNumberResource;
use App\Models\AuditLog;
use App\Models\GapRequest;
use App\Models\LetterNumber;
use App\Models\User;
use App\Services\NumberingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __construct(
        private readonly NumberingService $numberingService,
    ) {}

    /**
     * Aggregate endpoint untuk user dashboard.
     *
     * Menggabungkan 7 request paralel sebelumnya menjadi satu round-trip:
     *   - stats: jumlah surat user (hari ini, bulan ini, aktif, total)
     *   - recent_letters: 5 surat terbaru milik user
     *   - all_recent_letters: 10 surat terbaru dari semua user
     *   - sequence: info GlobalSequence (next_number, last_number, block info)
     *
     * Stats dihitung dengan satu query aggregate (COUNT + CASE WHEN) untuk menghindari
     * 4 query terpisah yang masing-masing membuat koneksi dan lifecycle Laravel sendiri.
     *
     * sequence di-wrap try-catch: jika GlobalSequence belum ada (fresh install),
     * dashboard tetap dapat dimuat — hanya field sequence yang null.
     */
    public function index(): JsonResponse
    {
        $userId = Auth::id();
        $today  = now()->toDateString();
        $firstOfMonth = now()->startOfMonth()->toDateString();

        // Satu query aggregate untuk semua stats — hindari 4 query COUNT terpisah
        $stats = LetterNumber::query()
            ->where('user_id', $userId)
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN issued_date = ? THEN 1 ELSE 0 END) as today,
                SUM(CASE WHEN issued_date >= ? THEN 1 ELSE 0 END) as month,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
            ", [$today, $firstOfMonth])
            ->first();

        // 5 surat terbaru milik user — eager load classification agar tidak N+1
        $recentLetters = LetterNumber::with('classification')
            ->where('user_id', $userId)
            ->orderByDesc('issued_date')
            ->orderByDesc('number')
            ->limit(5)
            ->get();

        // 10 surat terbaru dari semua user — eager load user + classification
        $allRecentLetters = LetterNumber::with(['user', 'classification'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        // Sequence info: read-only, tidak perlu lock
        // Null-safe: jika GlobalSequence belum ada, kembalikan null agar frontend
        // gracefully menampilkan '-' tanpa error
        try {
            $sequence = $this->numberingService->getSequenceInfo();
        } catch (\Throwable $e) {
            $sequence = null;
        }

        return response()->json([
            'data' => [
                'stats' => [
                    'total'  => (int) ($stats->total ?? 0),
                    'today'  => (int) ($stats->today ?? 0),
                    'month'  => (int) ($stats->month ?? 0),
                    'active' => (int) ($stats->active ?? 0),
                ],
                'recent_letters'     => LetterNumberResource::collection($recentLetters),
                'all_recent_letters' => LetterNumberResource::collection($allRecentLetters),
                'sequence'           => $sequence,
            ],
            'message' => 'Data dashboard berhasil diambil.',
        ]);
    }

    /**
     * Aggregate endpoint untuk admin dashboard.
     *
     * Menggabungkan 5 request terpisah menjadi satu round-trip:
     *   - stats: surat hari ini, gap request pending, user aktif (3 COUNT query)
     *   - all_recent_letters: 10 surat terbaru dari semua user
     *   - audit_logs: 10 audit log terbaru
     *   - sequence: info GlobalSequence (null-safe)
     *
     * getSummary() sebelumnya menjalankan 4 sub-query breakdown yang tidak perlu
     * untuk dashboard — diganti dengan COUNT tunggal per kebutuhan kartu statistik.
     */
    public function adminIndex(): JsonResponse
    {
        $today = now()->toDateString();

        // === Stats: 3 COUNT query — lebih ringan dari getSummary() yang punya 4 sub-query ===

        // Surat hari ini (semua user)
        $todayLettersCount = LetterNumber::whereDate('issued_date', $today)->count();

        // Gap request yang menunggu persetujuan
        $pendingGapsCount = GapRequest::where('status', 'pending')->count();

        // Total user aktif
        $activeUsersCount = User::where('is_active', true)->count();

        // 10 surat terbaru dari semua user — eager load user + classification
        $allRecentLetters = LetterNumber::with(['user', 'classification'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        // 10 audit log terbaru — eager load user
        $auditLogs = AuditLog::with('user')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        // Sequence info — null-safe (sama dengan user dashboard)
        try {
            $sequence = $this->numberingService->getSequenceInfo();
        } catch (\Throwable $e) {
            $sequence = null;
        }

        return response()->json([
            'data' => [
                'stats' => [
                    'today_letters' => $todayLettersCount,
                    'pending_gaps'  => $pendingGapsCount,
                    'active_users'  => $activeUsersCount,
                ],
                'all_recent_letters' => LetterNumberResource::collection($allRecentLetters),
                'audit_logs'         => AuditLogResource::collection($auditLogs),
                'sequence'           => $sequence,
            ],
            'message' => 'Data dashboard admin berhasil diambil.',
        ]);
    }
}

