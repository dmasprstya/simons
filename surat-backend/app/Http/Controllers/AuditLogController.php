<?php

namespace App\Http\Controllers;

use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Daftar audit log dengan filter komprehensif (admin only).
     *
     * Filter yang tersedia:
     *   - user_id:          ID user yang melakukan aksi
     *   - action:           nama aksi (e.g. letter.created, gap.approved)
     *   - table_name:       nama tabel yang terpengaruh
     *   - date_from:        batas awal tanggal aksi (format Y-m-d)
     *   - date_to:          batas akhir tanggal aksi (format Y-m-d)
     *   - classification_id: filter via new_data->classification_id (JSON column)
     *
     * Di-paginate 50 per halaman karena data audit bisa sangat banyak.
     */
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::query();

        // Filter berdasarkan user yang melakukan aksi
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter berdasarkan nama aksi (exact match)
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        // Filter berdasarkan nama tabel
        if ($request->filled('table_name')) {
            $query->where('table_name', $request->table_name);
        }

        // Filter rentang tanggal created_at (waktu aksi terjadi)
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Filter berdasarkan classification_id yang tersimpan di kolom JSON new_data
        // Berguna untuk menelusuri riwayat penomoran per klasifikasi
        if ($request->filled('classification_id')) {
            $query->where(function ($q) use ($request) {
                $q->whereJsonContains('new_data->classification_id', (int) $request->classification_id)
                  ->orWhereJsonContains('old_data->classification_id', (int) $request->classification_id);
            });
        }

        $logs = $query->with('user')->orderByDesc('created_at')->paginate(50);

        return response()->json([
            'data'    => AuditLogResource::collection($logs),
            'message' => 'Daftar audit log berhasil diambil.',
            'meta'    => $logs->toArray()['meta'] ?? [
                'current_page' => $logs->currentPage(),
                'last_page'    => $logs->lastPage(),
                'per_page'     => $logs->perPage(),
                'total'        => $logs->total(),
            ],
        ]);
    }

    /**
     * Tampilkan detail audit log beserta relasi user.
     */
    public function show(int $id): JsonResponse
    {
        $log = AuditLog::with('user')->findOrFail($id);

        return response()->json([
            'data'    => new AuditLogResource($log),
            'message' => 'Detail audit log berhasil diambil.',
        ]);
    }
}
