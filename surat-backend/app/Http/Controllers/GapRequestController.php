<?php

namespace App\Http\Controllers;

use App\Exceptions\GapAlreadyUsedException;
use App\Exceptions\NumberingLockException;
use App\Http\Requests\StoreGapRequestRequest;
use App\Http\Resources\GapRequestResource;
use App\Models\DailyGap;
use App\Models\GapRequest;
use App\Models\LetterNumber;
use App\Services\GapRequestService;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class GapRequestController extends Controller
{
    /**
     * Inject GapRequestService via constructor.
     * GapRequestService mengatur alur approve/reject termasuk
     * interaksi dengan NumberingService untuk releaseGapNumber().
     */
    public function __construct(
        private readonly GapRequestService $gapRequestService,
        private readonly AuditService $auditService,
    ) {}

    /**
     * Daftar gap request milik user yang sedang login.
     */
    public function index(): JsonResponse
    {
        $requests = GapRequest::with('classification')
            ->where('requested_by', Auth::id())
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'data'    => GapRequestResource::collection($requests),
            'message' => 'Daftar gap request berhasil diambil.',
            'meta'    => $requests->toArray()['meta'] ?? [
                'current_page' => $requests->currentPage(),
                'last_page'    => $requests->lastPage(),
                'per_page'     => $requests->perPage(),
                'total'        => $requests->total(),
            ],
        ]);
    }

    /**
     * Buat gap request baru.
     *
     * User mengajukan permintaan untuk mendapatkan nomor dari zona gap
     * (nomor cadangan). Admin akan mereview dan approve/reject.
     *
     * Validasi bisnis tambahan (setelah FormRequest):
     *   1. Nomor harus berada dalam rentang suatu baris DailyGap yang tercatat
     *      (artinya nomor berasal dari zona gap blok yang sudah ditutup hari sebelumnya).
     *   2. Nomor tidak boleh sedang dikunci oleh gap request lain yang masih
     *      pending atau sudah approved.
     */
    public function store(StoreGapRequestRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $items     = $validated['items'];
        $numbers   = collect($items)->pluck('number')->all();

        return DB::transaction(function () use ($validated, $items, $numbers) {
            // Guard 1 & 2: Validasi zona gap dan status lock untuk setiap nomor
            foreach ($numbers as $number) {
                $inGapZone = DailyGap::where('gap_start', '<=', $number)
                    ->where('gap_end', '>=', $number)
                    ->exists();

                if (!$inGapZone) {
                    return response()->json(['message' => "Nomor {$number} bukan bagian dari zona gap manapun."], 422);
                }

                $isLocked = GapRequest::where('number', $number)
                    ->whereIn('status', ['pending', 'approved'])
                    ->exists();

                if ($isLocked) {
                    return response()->json(['message' => "Nomor {$number} sudah direquest oleh user lain."], 422);
                }
            }

            // Guard 3: Harus mengambil nomor terkecil yang tersedia secara berurutan
            $count = count($numbers);
            $usedInLetters = LetterNumber::pluck('number')->all();
            $usedInRequests = GapRequest::whereIn('status', ['pending', 'approved'])
                ->whereNotNull('number')
                ->pluck('number')
                ->all();
            $excluded = array_flip(array_merge($usedInLetters, $usedInRequests));

            $vacantNumbers = [];
            $dailyGaps = DailyGap::orderBy('date')->get();
            foreach ($dailyGaps as $gap) {
                for ($n = $gap->gap_start; $n <= $gap->gap_end; $n++) {
                    if (!isset($excluded[$n])) {
                        $vacantNumbers[] = $n;
                        if (count($vacantNumbers) >= $count) break 2;
                    }
                }
            }

            sort($numbers);
            if ($numbers !== array_slice($vacantNumbers, 0, $count)) {
                $expected = implode(', ', array_slice($vacantNumbers, 0, $count));
                return response()->json([
                    'message' => "Anda harus mengambil nomor terkecil yang tersedia secara berurutan ({$expected}). Tidak diperbolehkan melompati nomor.",
                ], 422);
            }

            $createdRequests = [];
            foreach ($items as $item) {
                $gapRequest = GapRequest::create([
                    'classification_id' => $validated['classification_id'],
                    'requested_by'      => Auth::id(),
                    'number'            => $item['number'],
                    'gap_date'          => $item['gap_date'],
                    'subject'           => $validated['subject'],
                    'destination'       => $validated['destination'],
                    'sifat_surat'       => $validated['sifat_surat'],
                    'reason'            => $validated['reason'],
                    'status'            => 'pending',
                ]);

                // Log audit untuk setiap request yang dibuat
                $this->auditService->log(
                    'gap_request.created',
                    'gap_requests',
                    $gapRequest->id,
                    null,
                    [
                        'number'            => $gapRequest->number,
                        'gap_date'          => Carbon::parse($gapRequest->gap_date)->format('Y-m-d'),
                        'classification_id' => $gapRequest->classification_id,
                    ]
                );

                $createdRequests[] = $gapRequest;
            }

            return response()->json([
                'data'    => GapRequestResource::collection(collect($createdRequests)),
                'message' => count($createdRequests) . ' gap request berhasil diajukan.',
            ], 201);
        });
    }

    /**
     * Daftar semua gap request (admin only).
     *
     * Filter yang tersedia:
     *   - status:            pending | approved | rejected
     *   - classification_id: ID klasifikasi surat
     */
    public function all(Request $request): JsonResponse
    {
        $query = GapRequest::with(['requestedBy', 'reviewedBy', 'classification']);

        // Filter pencarian teks \u2014 nama user yang mengajukan
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('requestedBy', fn ($u) => $u->where('name', 'like', "%{$search}%"));
        }

        // Filter berdasarkan status review
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter berdasarkan klasifikasi
        if ($request->filled('classification_id')) {
            $query->where('classification_id', $request->classification_id);
        }

        // Filter rentang tanggal pengajuan
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $requests = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'data'    => GapRequestResource::collection($requests),
            'message' => 'Semua gap request berhasil diambil.',
            'meta'    => $requests->toArray()['meta'] ?? [
                'current_page' => $requests->currentPage(),
                'last_page'    => $requests->lastPage(),
                'per_page'     => $requests->perPage(),
                'total'        => $requests->total(),
            ],
        ]);
    }

    /**
     * Setujui (approve) gap request.
     *
     * Alur:
     *   1. Cek hanya request berstatus 'pending' yang bisa diapprove.
     *   2. Panggil GapRequestService::approve() yang memanggil releaseGapNumber()
     *      di dalam DB::transaction untuk mendapatkan nomor zona gap.
     *   3. Return GapRequestResource yang sudah di-load segar dari DB.
     *
     * Error yang ditangani:
     *   - NumberingLockException: deadlock saat lock sequence → 409
     *   - GapAlreadyUsedException: nomor gap sudah diterbitkan → 422
     *   - InvalidArgumentException: status bukan pending → 422
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $gapRequest = GapRequest::findOrFail($id);

        try {
            // Panggil service approval — terbitkan nomor dari zona gap
            $this->gapRequestService->approve($gapRequest, $request->user());
        } catch (NumberingLockException $e) {
            // Deadlock atau lock timeout saat acquire sequence
            return response()->json(['message' => $e->getMessage()], 409);
        } catch (GapAlreadyUsedException $e) {
            // Nomor gap sudah pernah diterbitkan sebelumnya
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\InvalidArgumentException $e) {
            // Status bukan 'pending' — tidak dapat diapprove
            return response()->json(['message' => $e->getMessage()], 422);
        }

        // Load ulang dengan relasi untuk response yang lengkap
        $gapRequest->load(['classification', 'requestedBy', 'reviewedBy']);

        return response()->json([
            'data'    => new GapRequestResource($gapRequest->fresh(['classification', 'requestedBy', 'reviewedBy'])),
            'message' => 'Gap request berhasil disetujui.',
        ]);
    }

    /**
     * Tolak (reject) gap request.
     *
     * reason wajib disertakan untuk traceability di audit log.
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $gapRequest = GapRequest::findOrFail($id);

        try {
            $this->gapRequestService->reject($gapRequest, $request->user(), $request->reason);
        } catch (\InvalidArgumentException $e) {
            // Status bukan 'pending' — tidak dapat direject
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'data'    => new GapRequestResource($gapRequest->fresh()),
            'message' => 'Gap request berhasil ditolak.',
        ]);
    }
}
