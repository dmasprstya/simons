<?php

use App\Http\Controllers\AuthController;
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

// === USERS ===

// === CLASSIFICATIONS ===

// === LETTERS ===

// === SEQUENCES ===

// === GAP REQUESTS ===

// === AUDIT LOGS ===

// === REPORTS ===
