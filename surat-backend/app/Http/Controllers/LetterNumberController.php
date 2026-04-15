<?php

namespace App\Http\Controllers;

use App\Exceptions\NumberingLockException;
use App\Http\Requests\StoreLetterNumberRequest;
use App\Http\Resources\LetterNumberResource;
use App\Models\LetterNumber;
use App\Services\NumberingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LetterNumberController extends Controller
{
    /**
     * Inject NumberingService via constructor — service ini bertanggung jawab
     * untuk acquire nomor dengan pessimistic locking dan gap-block logic.
     */
    public function __construct(
        private readonly NumberingService $numberingService,
    ) {}

    /**
     * Daftar surat milik user yang sedang login.
     *
     * Filter yang tersedia:
     *   - issued_date_from: batas awal tanggal surat (format Y-m-d)
     *   - issued_date_to:   batas akhir tanggal surat (format Y-m-d)
     *   - classification_id: ID klasifikasi surat
     */
    public function index(Request $request): JsonResponse
    {
        $query = LetterNumber::with('classification')->where('user_id', Auth::id());

        // Filter rentang tanggal issued_date — terima date_from/date_to (frontend) atau issued_date_from/issued_date_to
        $dateFrom = $request->input('date_from', $request->input('issued_date_from'));
        $dateTo   = $request->input('date_to', $request->input('issued_date_to'));

        if ($dateFrom) {
            $query->whereDate('issued_date', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('issued_date', '<=', $dateTo);
        }

        // Filter berdasarkan klasifikasi
        if ($request->filled('classification_id')) {
            $query->where('classification_id', $request->classification_id);
        }

        $perPage = (int) $request->input('per_page', 20);
        $letters = $query->orderByDesc('issued_date')->orderByDesc('number')->paginate($perPage);

        return response()->json([
            'data'    => LetterNumberResource::collection($letters),
            'message' => 'Daftar nomor surat berhasil diambil.',
            'meta'    => $letters->toArray()['meta'] ?? [
                'current_page' => $letters->currentPage(),
                'last_page'    => $letters->lastPage(),
                'per_page'     => $letters->perPage(),
                'total'        => $letters->total(),
            ],
        ]);
    }

    /**
     * Terbitkan (acquire) nomor surat baru.
     *
     * Alur:
     *   1. Validasi input via StoreLetterNumberRequest.
     *   2. Panggil NumberingService::acquireNumber() untuk mendapatkan nomor
     *      berikutnya dalam zona aktif (dengan pessimistic locking).
     *   3. Simpan record LetterNumber baru.
     *   4. Return 201 dengan data nomor yang diterbitkan.
     *
     * NumberingLockException terjadi jika terjadi deadlock atau race condition
     * setelah maxAttempts — dikembalikan sebagai 409 Conflict.
     */
    public function store(StoreLetterNumberRequest $request): JsonResponse
    {
        try {
            // Acquire nomor berikutnya dalam zona aktif blok saat ini
            $number = $this->numberingService->acquireNumber();
        } catch (NumberingLockException $e) {
            // Lock timeout atau deadlock melebihi batas retry → 409 Conflict
            return response()->json(['message' => $e->getMessage()], 409);
        }

        // Fetch kode klasifikasi untuk membangun formatted_number
        $classification = \App\Models\LetterClassification::find($request->classification_id);

        $letter = LetterNumber::create([
            'user_id'           => Auth::id(),
            'classification_id' => $request->classification_id,
            'number'            => $number,
            'formatted_number'  => LetterNumber::buildFormattedNumber(
                                       $classification->code,
                                       $number
                                   ),
            'issued_date'       => today(),
            'subject'           => $request->subject,
            'destination'       => $request->destination,
            'sifat_surat'       => $request->sifat_surat,
            'status'            => 'active',
        ]);

        // Eager load classification agar LetterNumberResource::whenLoaded() ikut me-render data klasifikasi
        $letter->load('classification');

        return response()->json([
            'data'    => new LetterNumberResource($letter),
            'message' => 'Nomor surat berhasil diterbitkan.',
        ], 201);
    }

    /**
     * Tampilkan detail surat beserta relasi user, klasifikasi, dan voider.
     */
    public function show(int $id): JsonResponse
    {
        $letter = LetterNumber::with(['user', 'classification', 'voidedBy'])->findOrFail($id);

        return response()->json([
            'data'    => new LetterNumberResource($letter),
            'message' => 'Detail nomor surat berhasil diambil.',
        ]);
    }

    /**
     * Batalkan (void) nomor surat.
     *
     * Aturan bisnis void:
     *   1. Hanya pemilik surat yang dapat mem-void (bukan admin lain) → 403.
     *   2. Void hanya diperbolehkan pada hari yang sama dengan issued_date → 422.
     *      Ini mencegah penghapusan nomor historis yang sudah terkirim.
     *   3. Surat yang sudah voided tidak dapat di-void lagi → 422.
     */
    public function void(Request $request, int $id): JsonResponse
    {
        $letter = LetterNumber::findOrFail($id);

        // Surat hanya dapat di-void oleh pemiliknya sendiri
        if ($letter->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses untuk mem-void surat ini.',
            ], 403);
        }

        // Void hanya boleh dilakukan pada hari yang sama dengan issued_date
        // Carbon::parse() digunakan eksplisit agar isToday() dikenali static analyzer
        // (cast 'date' di model menghasilkan Carbon di runtime, tapi tipe-nya tidak diinfer IDE)
        if (! \Carbon\Carbon::parse($letter->issued_date)->isToday()) {
            return response()->json([
                'message' => 'Surat hanya dapat dibatalkan pada hari penerbitan.',
            ], 422);
        }

        // Cegah double-void
        if ($letter->status === 'voided') {
            return response()->json([
                'message' => 'Surat ini sudah dalam status voided.',
            ], 422);
        }

        $letter->update([
            'status'    => 'voided',
            'voided_at' => now(),
            'voided_by' => Auth::id(),
        ]);

        return response()->json([
            'data'    => new LetterNumberResource($letter->fresh()),
            'message' => 'Nomor surat berhasil dibatalkan.',
        ]);
    }

    /**
     * Daftar semua surat (admin only).
     *
     * Filter yang tersedia:
     *   - classification_id: ID klasifikasi surat
     *   - user_id:           ID pembuat surat
     *   - issued_date_from:  batas awal tanggal surat
     *   - issued_date_to:    batas akhir tanggal surat
     */
    /**
     * Riwayat pengambilan nomor surat terbaru dari semua user.
     *
     * Endpoint ini dapat diakses oleh semua user yang terautentikasi (bukan admin only).
     * Mengembalikan 10 surat terakhir beserta relasi user dan classification
     * agar terlihat siapa yang mengambil nomor dan klasifikasi suratnya.
     */
    public function recentAll(Request $request): JsonResponse
    {
        $limit = min((int) $request->input('limit', 10), 50);

        $letters = LetterNumber::with(['user', 'classification'])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        return response()->json([
            'data'    => LetterNumberResource::collection($letters),
            'message' => 'Riwayat pengambilan nomor surat terbaru berhasil diambil.',
        ]);
    }

    /**
     * Daftar semua surat (admin only).
     *
     * Filter yang tersedia:
     *   - classification_id: ID klasifikasi surat
     *   - user_id:           ID pembuat surat
     *   - issued_date_from:  batas awal tanggal surat
     *   - issued_date_to:    batas akhir tanggal surat
     */
    public function all(Request $request): JsonResponse
    {
        $query = LetterNumber::with(['user', 'classification']);

        // Filter pencarian teks — nama user, perihal, nomor, atau formatted_number
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                  ->orWhere('formatted_number', 'like', "%{$search}%")
                  ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }

        // Filter berdasarkan klasifikasi
        if ($request->filled('classification_id')) {
            $query->where('classification_id', $request->classification_id);
        }

        // Filter berdasarkan user pembuat
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter berdasarkan divisi user
        if ($request->filled('division')) {
            $query->whereHas('user', fn ($u) => $u->where('division', 'like', '%' . $request->division . '%'));
        }

        // Filter rentang tanggal issued_date — terima date_from/date_to atau issued_date_from/issued_date_to
        $dateFrom = $request->input('date_from', $request->input('issued_date_from'));
        $dateTo   = $request->input('date_to', $request->input('issued_date_to'));

        if ($dateFrom) {
            $query->whereDate('issued_date', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('issued_date', '<=', $dateTo);
        }

        $letters = $query->orderByDesc('issued_date')->orderByDesc('number')->paginate(20);

        return response()->json([
            'data'    => LetterNumberResource::collection($letters),
            'message' => 'Semua nomor surat berhasil diambil.',
            'meta'    => $letters->toArray()['meta'] ?? [
                'current_page' => $letters->currentPage(),
                'last_page'    => $letters->lastPage(),
                'per_page'     => $letters->perPage(),
                'total'        => $letters->total(),
            ],
        ]);
    }
}
