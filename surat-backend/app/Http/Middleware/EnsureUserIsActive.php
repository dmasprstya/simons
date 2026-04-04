<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    /**
     * Pastikan user yang sedang menggunakan token masih berstatus aktif.
     * Jika tidak aktif: revoke semua token aktif user tersebut, lalu return 403.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        // is_active dicast ke boolean di model User, sehingga strict comparison aman
        if ($user && ! $user->is_active) {
            // Revoke semua personal access token milik user ini
            $user->tokens()->delete();

            return response()->json(['message' => 'Akun Anda dinonaktifkan.'], 403);
        }

        return $next($request);
    }
}
