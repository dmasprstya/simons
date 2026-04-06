<?php

namespace App\Http\Controllers;

use App\Exceptions\GapAlreadyUsedException;
use App\Exceptions\NumberingLockException;
use App\Http\Requests\StoreGapRequestRequest;
use App\Http\Resources\GapRequestResource;
use App\Models\GapRequest;
use App\Services\GapRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GapRequestController extends Controller
{
    /**
     * Inject GapRequestService via constructor.
     * GapRequestService mengatur alur approve/reject termasuk
     * interaksi dengan NumberingService untuk releaseGapNumber().
     */
    public function __construct(
        private readonly GapRequestService $gapRequestService,
    ) {}

    /**
     * Daftar gap request milik user yang sedang login.
     */
    public function index(): JsonResponse
    {
        $requests = GapRequest::where('requested_by', Auth::id())
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
     */
    public function store(StoreGapRequestRequest $request): JsonResponse
    {
        $validated                = $request->validated();
        $validated['requested_by'] = Auth::id();
        $validated['status']      = 'pending';

        $gapRequest = GapRequest::create($validated);

        return response()->json([
            'data'    => new GapRequestResource($gapRequest),
            'message' => 'Gap request berhasil diajukan.',
        ], 201);
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
        $query = GapRequest::query();

        // Filter berdasarkan status review
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter berdasarkan klasifikasi
        if ($request->filled('classification_id')) {
            $query->where('classification_id', $request->classification_id);
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
