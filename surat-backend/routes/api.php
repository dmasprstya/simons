<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    AuthController,
    ProfileController,
    UserController,
    LetterClassificationController,
    LetterNumberController,
    DailySequenceController,
    GapRequestController,
    AuditLogController,
    ReportController
};

// === AUTH ===
Route::prefix('auth')->group(function (): void {
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
        Route::post('logout',          [AuthController::class, 'logout']);
        Route::get('me',               [AuthController::class, 'me']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
    });
});

Route::middleware(['auth:sanctum', 'active'])->group(function (): void {

    // === USERS (admin only) ===
    Route::prefix('users')->middleware('role:admin')->group(function (): void {
        Route::get('/',                [UserController::class, 'index']);
        Route::post('/',               [UserController::class, 'store']);
        Route::get('/{id}',            [UserController::class, 'show']);
        Route::put('/{id}',            [UserController::class, 'update']);
        Route::patch('/{id}/toggle-active', [UserController::class, 'toggleActive']);
    });

    // === CLASSIFICATIONS ===
    Route::prefix('classifications')->group(function (): void {
        // Read — semua user
        Route::get('/',              [LetterClassificationController::class, 'index']);
        // Route statis HARUS didaftarkan sebelum route dinamis /{id}
        Route::get('/{id}/children', [LetterClassificationController::class, 'children']);
        Route::get('/{id}',          [LetterClassificationController::class, 'show']);
        // Write — admin only
        Route::middleware('role:admin')->group(function (): void {
            Route::post('/',                    [LetterClassificationController::class, 'store']);
            Route::put('/{id}',                 [LetterClassificationController::class, 'update']);
            Route::patch('/{id}/toggle-active', [LetterClassificationController::class, 'toggleActive']);
        });
    });

    // === LETTERS ===
    Route::prefix('letters')->group(function (): void {
        // Route statis HARUS didaftarkan sebelum route dinamis /{id}
        Route::get('/recent', [LetterNumberController::class, 'recentAll']); // semua user
        Route::get('/all', [LetterNumberController::class, 'all'])->middleware('role:admin');
        Route::get('/',    [LetterNumberController::class, 'index']);
        Route::post('/',   [LetterNumberController::class, 'store']);
        Route::get('/{id}',        [LetterNumberController::class, 'show']);
        Route::patch('/{id}/void', [LetterNumberController::class, 'void']);
    });

    // === SEQUENCES ===
    Route::prefix('sequences')->group(function (): void {
        // Route statis HARUS didaftarkan sebelum route lainnya
        Route::get('/today', [DailySequenceController::class, 'today']);
        Route::patch('/gap', [DailySequenceController::class, 'updateGap'])->middleware('role:admin');
        Route::get('/',      [DailySequenceController::class, 'index'])->middleware('role:admin');
    });

    // === GAP REQUESTS ===
    Route::prefix('gap-requests')->group(function (): void {
        // Route statis HARUS didaftarkan sebelum route dinamis /{id}
        Route::get('/all', [GapRequestController::class, 'all'])->middleware('role:admin');
        Route::get('/',    [GapRequestController::class, 'index']);
        Route::post('/',   [GapRequestController::class, 'store']);
        Route::middleware('role:admin')->group(function (): void {
            Route::patch('/{id}/approve', [GapRequestController::class, 'approve']);
            Route::patch('/{id}/reject',  [GapRequestController::class, 'reject']);
        });
    });

    // === PROFILE ===
    Route::prefix('profile')->group(function (): void {
        Route::get('/',                 [ProfileController::class, 'show']);
        Route::put('/',                 [ProfileController::class, 'update']);
        Route::post('/change-password', [ProfileController::class, 'changePassword']);
        Route::post('/photo',           [ProfileController::class, 'uploadPhoto']);
        Route::delete('/photo',         [ProfileController::class, 'deletePhoto']);
    });

    // === AUDIT LOGS (admin only) ===
    Route::prefix('audit-logs')->middleware('role:admin')->group(function (): void {
        Route::get('/',     [AuditLogController::class, 'index']);
        Route::get('/{id}', [AuditLogController::class, 'show']);
    });

    // === REPORTS (admin only) ===
    Route::prefix('reports')->middleware('role:admin')->group(function (): void {
        Route::get('/summary', [ReportController::class, 'summary']);
        Route::get('/export',  [ReportController::class, 'export']);
    });

}); // end auth:sanctum + active
