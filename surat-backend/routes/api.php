<?php

use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DailySequenceController;
use App\Http\Controllers\GapRequestController;
use App\Http\Controllers\LetterClassificationController;
use App\Http\Controllers\LetterNumberController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// === AUTH ===
Route::prefix('auth')->group(function (): void {
    // Login tidak memerlukan autentikasi
    Route::post('login', [AuthController::class, 'login']);

    // Endpoint berikut memerlukan token Sanctum yang valid + akun aktif
    Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
    });
});

// Semua endpoint di bawah ini membutuhkan autentikasi Sanctum + akun aktif
Route::middleware(['auth:sanctum', 'active'])->group(function (): void {

    // === USERS (admin only) ===
    Route::middleware('role:admin')->prefix('users')->group(function (): void {
        Route::get('/', [UserController::class, 'index']);
        Route::post('/', [UserController::class, 'store']);
        Route::get('{id}', [UserController::class, 'show']);
        Route::put('{id}', [UserController::class, 'update']);
        Route::patch('{id}/toggle-active', [UserController::class, 'toggleActive']);
    });

    // === CLASSIFICATIONS ===
    Route::prefix('classifications')->group(function (): void {
        // Daftar parent + children — dapat diakses semua authenticated user
        Route::get('/', [LetterClassificationController::class, 'index']);
        Route::get('{id}', [LetterClassificationController::class, 'show']);
        Route::get('{id}/children', [LetterClassificationController::class, 'children']);

        // Mutasi hanya admin
        Route::middleware('role:admin')->group(function (): void {
            Route::post('/', [LetterClassificationController::class, 'store']);
            Route::put('{id}', [LetterClassificationController::class, 'update']);
            Route::patch('{id}/toggle-active', [LetterClassificationController::class, 'toggleActive']);
        });
    });

    // === LETTERS ===
    Route::prefix('letters')->group(function (): void {
        // Surat milik user sendiri
        Route::get('/', [LetterNumberController::class, 'index']);
        Route::post('/', [LetterNumberController::class, 'store']);
        Route::get('{id}', [LetterNumberController::class, 'show']);
        Route::patch('{id}/void', [LetterNumberController::class, 'void']);

        // Semua surat — admin only
        Route::get('all/list', [LetterNumberController::class, 'all'])->middleware('role:admin');
    });

    // === SEQUENCES ===
    Route::prefix('sequences')->group(function (): void {
        // Sequence hari ini — semua authenticated user (dipakai sebelum buat surat)
        Route::get('today', [DailySequenceController::class, 'today']);

        // Admin only
        Route::middleware('role:admin')->group(function (): void {
            Route::get('/', [DailySequenceController::class, 'index']);
            Route::patch('gap', [DailySequenceController::class, 'updateGap']);
        });
    });

    // === GAP REQUESTS ===
    Route::prefix('gap-requests')->group(function (): void {
        // Request milik user sendiri
        Route::get('/', [GapRequestController::class, 'index']);
        Route::post('/', [GapRequestController::class, 'store']);

        // Admin only
        Route::middleware('role:admin')->group(function (): void {
            Route::get('all/list', [GapRequestController::class, 'all']);
            Route::patch('{id}/approve', [GapRequestController::class, 'approve']);
            Route::patch('{id}/reject', [GapRequestController::class, 'reject']);
        });
    });

    // === AUDIT LOGS (admin only) ===
    Route::middleware('role:admin')->prefix('audit-logs')->group(function (): void {
        Route::get('/', [AuditLogController::class, 'index']);
        Route::get('{id}', [AuditLogController::class, 'show']);
    });

    // === REPORTS (admin only) ===
    Route::middleware('role:admin')->prefix('reports')->group(function (): void {
        Route::get('summary', [ReportController::class, 'summary']);
        Route::get('export', [ReportController::class, 'export']);
    });

}); // end auth:sanctum + active
