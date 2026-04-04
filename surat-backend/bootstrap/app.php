<?php

use App\Exceptions\GapAlreadyUsedException;
use App\Exceptions\NumberingLockException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Lock timeout / deadlock di NumberingService → 409 Conflict
        $exceptions->render(function (NumberingLockException $e) {
            return response()->json(['message' => 'Nomor sedang diproses, coba lagi.'], 409);
        });

        // Nomor gap sudah digunakan → 422 Unprocessable Entity
        $exceptions->render(function (GapAlreadyUsedException $e) {
            return response()->json(['message' => 'Nomor gap sudah digunakan.'], 422);
        });
    })->create();
