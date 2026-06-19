<?php

namespace App\Support;

class FrontendUrl
{
    public static function base(): string
    {
        $url = trim((string) config('app.frontend_url', config('app.url')));

        if ($url === '') {
            return 'http://localhost:3000';
        }

        // Corrige les valeurs concaténées par erreur (ex. 192.168.x.xhttp://…)
        if (preg_match('#https?://[^\s]+#i', $url, $matches)) {
            $url = $matches[0];
        } elseif (! preg_match('#^https?://#i', $url)) {
            $url = 'https://'.ltrim($url, '/');
        }

        return rtrim($url, '/');
    }

    /**
     * Origine frontend autorisée (Vercel, Partnext, local…) ou fallback APP_FRONTEND_URL.
     */
    public static function resolveOrigin(?string $candidate): string
    {
        $normalized = self::normalizeOrigin(is_string($candidate) ? $candidate : '');
        if ($normalized !== null && self::isAllowedOrigin($normalized)) {
            return $normalized;
        }

        return self::base();
    }

    public static function isAllowedOrigin(string $origin): bool
    {
        $origin = rtrim(trim($origin), '/');
        if ($origin === '') {
            return false;
        }

        foreach (config('cors.allowed_origins', []) as $allowed) {
            if (rtrim((string) $allowed, '/') === $origin) {
                return true;
            }
        }

        foreach (config('cors.allowed_origins_patterns', []) as $pattern) {
            if (is_string($pattern) && @preg_match($pattern, $origin) === 1) {
                return true;
            }
        }

        return false;
    }

    private static function normalizeOrigin(string $origin): ?string
    {
        $origin = trim($origin);
        if ($origin === '') {
            return null;
        }

        if (preg_match('~^(https?://[^\s/?#]+)~i', $origin, $matches)) {
            return rtrim($matches[1], '/');
        }

        return null;
    }

    public static function path(string $path): string
    {
        return self::base().'/'.ltrim($path, '/');
    }

    public static function referralLink(string $code): string
    {
        return self::path('formations?ref='.rawurlencode($code));
    }
}
