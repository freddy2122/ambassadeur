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

    public static function path(string $path): string
    {
        return self::base().'/'.ltrim($path, '/');
    }

    public static function referralLink(string $code): string
    {
        return self::path('formations?ref='.rawurlencode($code));
    }
}
