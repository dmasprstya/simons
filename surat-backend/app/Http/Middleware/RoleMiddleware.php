<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Periksa apakah user yang sedang login memiliki role yang diperlukan.
     * Role dikirim sebagai parameter dari definisi route (misal: middleware('role:admin')).
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Pastikan user sudah terautentikasi sebelum memeriksa role
        if (! Auth::check() || Auth::user()->role !== $role) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        return $next($request);
    }
}
