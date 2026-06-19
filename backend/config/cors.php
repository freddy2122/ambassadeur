<?php

$defaultOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'https://ambassadeur.partnext.org',
    'https://ambassadeur-lilac.vercel.app',
];

/** Préfixes Vercel / Partnext : previews et sous-domaines sans les lister un par un. */
$defaultOriginPatterns = [
    '#^https://[\w-]+\.vercel\.app$#',
    '#^https://[\w.-]+\.partnext\.org$#',
];

$extraOrigins = array_filter(array_map(
    trim(...),
    explode(',', (string) env('CORS_ALLOWED_ORIGINS', '')),
));

$extraPatterns = array_filter(array_map(
    trim(...),
    explode(',', (string) env('CORS_ALLOWED_ORIGIN_PATTERNS', '')),
));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_values(array_unique(array_merge($defaultOrigins, $extraOrigins))),
    'allowed_origins_patterns' => array_values(array_unique(array_merge($defaultOriginPatterns, $extraPatterns))),
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
