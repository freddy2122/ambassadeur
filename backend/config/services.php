<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | FedaPay — collectes (inscription) + virements commissions (transfers)
    | Sandbox : https://sandbox-api.fedapay.com/v1 — mode test momo_test (FEDAPAY_CHECKOUT_MODE)
    |--------------------------------------------------------------------------
    */
    'fedapay' => [
        /** Clé secrète Bearer (live ou test). Alias supporté : FEDAPAY_SECRET_KEY (docs FedaPay pk_/sk_) */
        'api_key' => env('FEDAPAY_API_KEY', env('FEDAPAY_SECRET_KEY')),
        'public_key' => env('FEDAPAY_PUBLIC_KEY'),
        'environment' => env('FEDAPAY_ENV'),
        'base_url' => env('FEDAPAY_BASE_URL', 'https://api.fedapay.com/v1'),
        /** Ex. momo_test en sandbox — laisser vide en production si le compte definit le mode par defaut */
        'checkout_mode' => env('FEDAPAY_CHECKOUT_MODE'),
        /** Secret du point de terminaison webhook (optionnel ; verification a renforcer en prod) */
        'webhook_secret' => env('FEDAPAY_WEBHOOK_SECRET'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Prestataire paiement actif : fedapay | geniuspay
    |--------------------------------------------------------------------------
    */
    'payment' => [
        'driver' => env('PAYMENT_DRIVER', 'fedapay'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Genius Pay — collectes (inscription) + payouts commissions
    | Sandbox : clés pk_sandbox_ / sk_sandbox_ depuis le tableau de bord
    | Doc : https://pay.genius.ci/docs/api
    |--------------------------------------------------------------------------
    */
    'geniuspay' => [
        'api_key' => env('GENIUSPAY_API_KEY'),
        'api_secret' => env('GENIUSPAY_API_SECRET'),
        'webhook_secret' => env('GENIUSPAY_WEBHOOK_SECRET'),
        'base_url' => env('GENIUSPAY_BASE_URL', 'https://geniuspay.ci/api/v1/merchant'),
        'payout_wallet_id' => env('GENIUSPAY_PAYOUT_WALLET_ID'),
        'sandbox' => env('GENIUSPAY_SANDBOX', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Versements commissions ambassadeurs
    |--------------------------------------------------------------------------
    */
    'payout' => [
        'auto_enabled' => env('PAYOUT_AUTO_ENABLED', false),
        'auto_run_time' => env('PAYOUT_AUTO_RUN_TIME', '02:00'),
        'auto_min_amount_xof' => (float) env('PAYOUT_AUTO_MIN_AMOUNT_XOF', 0),
        'auto_generate_commissions_first' => env('PAYOUT_AUTO_GENERATE_COMMISSIONS_FIRST', true),
        'auto_require_verified_email' => env('PAYOUT_AUTO_REQUIRE_VERIFIED_EMAIL', true),
        'auto_require_profile_approved' => env('PAYOUT_AUTO_REQUIRE_PROFILE_APPROVED', false),
        'auto_retry_enabled' => env('PAYOUT_AUTO_RETRY_ENABLED', true),
        'auto_retry_max_attempts' => (int) env('PAYOUT_AUTO_RETRY_MAX_ATTEMPTS', 4),
        'auto_retry_base_minutes' => (int) env('PAYOUT_AUTO_RETRY_BASE_MINUTES', 30),
    ],

];
