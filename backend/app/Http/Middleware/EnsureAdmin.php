<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Authentification requise.',
                ], 401);
            }

            return redirect()->guest(route('login'));
        }

        if ($user->role !== 'admin') {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Accès administrateur requis.',
                ], 403);
            }

            return redirect()->route('dashboard')->with('error', "Accès réservé à l'administration.");
        }

        return $next($request);
    }
}
