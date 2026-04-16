<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    AuthController,
    DashboardController,
    ProfileController,
    UserController,
    LetterClassificationController,
    LetterNumberController,
    DailySequenceController,
    GapRequestController,
    GapNumberController,
    AuditLogController,
    ReportController
};

// === AUTH ===
Route::prefix('auth')->group(function (): void {
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
    });
});

Route::middleware(['auth:sanctum', 'active'])->group(function (): void {

    // === DASHBOARD ===
    Route::get('dashboard', [DashboardController::class, 'index'])->middleware('role:user');
    Route::get('dashboard/admin', [DashboardController::class, 'adminIndex'])->middleware('role:admin');

    // === USERS (admin only) ===
    Route::prefix('users')->middleware('role:admin')->group(function (): void {
        Route::get('/', [UserController::class, 'index']);
        Route::post('/', [UserController::class, 'store']);
        Route::get('/{id}', [UserController::class, 'show']);
        Route::put('/{id}', [UserController::class, 'update']);
        Route::patch('/{id}/toggle-active', [UserController::class, 'toggleActive']);
    });

    // === CLASSIFICATIONS ===
    Route::prefix('classifications')->group(function (): void {
        // Read — semua user
        Route::get('/', [LetterClassificationController::class, 'index']);
        // Route statis HARUS didaftarkan sebelum route dinamis /{id}
        Route::get('/search', [LetterClassificationController::class, 'search']);
        Route::get('/{id}/children', [LetterClassificationController::class, 'children']);
        Route::get('/{id}', [LetterClassificationController::class, 'show']);
        // Write & admin-only reads
        Route::middleware('role:admin')->group(function (): void {
            // Flat list semua level — berguna untuk admin mengelola & debug child classifications
            Route::get('/all', [LetterClassificationController::class, 'allFlat']);
            Route::post('/', [LetterClassificationController::class, 'store']);
            Route::put('/{id}', [LetterClassificationController::class, 'update']);
            Route::patch('/{id}/toggle-active', [LetterClassificationController::class, 'toggleActive']);
            Route::delete('/{id}', [LetterClassificationController::class, 'destroy']);
        });
    });

    // === LETTERS ===
    Route::prefix('letters')->group(function (): void {
        // Route statis HARUS didaftarkan sebelum route dinamis /{id}
        Route::get('/recent', [LetterNumberController::class, 'recentAll']); // semua user
        Route::get('/all', [LetterNumberController::class, 'all'])->middleware('role:admin');
        Route::get('/', [LetterNumberController::class, 'index']);
        // Pengambilan nomor surat — hanya bisa dilakukan user biasa, bukan admin
        Route::post('/', [LetterNumberController::class, 'store'])->middleware('role:user');
        Route::get('/{id}', [LetterNumberController::class, 'show']);
        Route::patch('/{id}/void', [LetterNumberController::class, 'void']);
    });

    // === SEQUENCES ===
    Route::prefix('sequences')->group(function (): void {
        // Route statis HARUS didaftarkan sebelum route lainnya
        Route::get('/today', [DailySequenceController::class, 'today']);
        Route::patch('/gap', [DailySequenceController::class, 'updateGap'])->middleware('role:admin');
        Route::post('/reset', [DailySequenceController::class, 'reset'])->middleware('role:admin');
        Route::get('/', [DailySequenceController::class, 'index'])->middleware('role:admin');
    });

    // === GAP REQUESTS ===
    Route::prefix('gap-requests')->group(function (): void {
        // Route statis HARUS didaftarkan sebelum route dinamis /{id}
        Route::get('/all', [GapRequestController::class, 'all'])->middleware('role:admin');
        Route::get('/', [GapRequestController::class, 'index']);
        // Pengajuan gap request — hanya bisa dilakukan user biasa, bukan admin
        Route::post('/', [GapRequestController::class, 'store'])->middleware('role:user');
        Route::middleware('role:admin')->group(function (): void {
            Route::patch('/{id}/approve', [GapRequestController::class, 'approve']);
            Route::patch('/{id}/reject', [GapRequestController::class, 'reject']);
        });
    });

    // === PROFILE ===
    Route::prefix('profile')->group(function (): void {
        Route::get('/', [ProfileController::class, 'show']);
        Route::put('/', [ProfileController::class, 'update']);
        Route::post('/change-password', [ProfileController::class, 'changePassword']);
        Route::post('/photo', [ProfileController::class, 'uploadPhoto']);
        Route::delete('/photo', [ProfileController::class, 'deletePhoto']);
    });

    // === AUDIT LOGS (admin only) ===
    Route::prefix('audit-logs')->middleware('role:admin')->group(function (): void {
        Route::get('/', [AuditLogController::class, 'index']);
        Route::get('/{id}', [AuditLogController::class, 'show']);
    });

    // === REPORTS (admin only) ===
    Route::prefix('reports')->middleware('role:admin')->group(function (): void {
        Route::get('/summary', [ReportController::class, 'summary']);
        Route::get('/export', [ReportController::class, 'export']);
    });

    // === GAP NUMBERS (nomor kosong dari zona gap harian) ===
    // Tersedia untuk semua user terautentikasi — digunakan saat mengajukan gap request.
    Route::get('/gap-numbers', [GapNumberController::class, 'index']);

}); // end auth:sanctum + active
