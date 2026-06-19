<?php

use App\Http\Controllers\Api\Admin\ChallengeController;
use App\Http\Controllers\Api\Admin\CommissionProcessController;
use App\Http\Controllers\Api\Admin\CommissionRuleController;
use App\Http\Controllers\Api\Admin\FormationPricingController;
use App\Http\Controllers\Api\Admin\AdminOverviewController;
use App\Http\Controllers\Api\Admin\PayoutController;
use App\Http\Controllers\Api\Admin\PayoutRunController;
use App\Http\Controllers\Api\AmbassadorDashboardController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FedaPayPaymentController;
use App\Http\Controllers\Api\GeniusPayPaymentController;
use App\Http\Controllers\Api\FormationCatalogController;
use App\Http\Controllers\Api\PaymentGatewayController;
use App\Http\Controllers\Api\ReferralController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');
    Route::post('/auth/verify-code', [AuthController::class, 'verifyCode'])->middleware('throttle:8,1');
    Route::post('/auth/resend-code', [AuthController::class, 'resendCode'])->middleware('throttle:4,1');

    Route::get('/referrals/{code}', [ReferralController::class, 'track']);
    Route::post('/prospects', [ReferralController::class, 'storeProspect'])->middleware('throttle:8,1');
    Route::get('/catalog/platform-stats', [FormationCatalogController::class, 'platformStats']);
    Route::get('/catalog/commission-rules', [FormationCatalogController::class, 'commissionRulesIndex']);
    Route::get('/catalog/formations/pricing', [FormationCatalogController::class, 'pricingIndex']);
    Route::get('/catalog/formations/{slug}/pricing', [FormationCatalogController::class, 'pricingShow']);

    Route::get('/payments/config', [PaymentGatewayController::class, 'config']);
    Route::post('/payments/initialize', [PaymentGatewayController::class, 'initialize']);

    Route::post('/payments/fedapay/initialize', [FedaPayPaymentController::class, 'initialize']);
    Route::get('/payments/fedapay/callback', [FedaPayPaymentController::class, 'callback']);
    Route::post('/payments/fedapay/webhook', [FedaPayPaymentController::class, 'webhook']);

    Route::post('/payments/geniuspay/initialize', [GeniusPayPaymentController::class, 'initialize']);
    Route::get('/payments/geniuspay/callback', [GeniusPayPaymentController::class, 'callback']);
    Route::post('/payments/geniuspay/webhook', [GeniusPayPaymentController::class, 'webhook']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        Route::get('/me/earnings', [AmbassadorDashboardController::class, 'earnings']);
        Route::get('/me/dashboard', [AmbassadorDashboardController::class, 'index']);
        Route::get('/me/leaderboard', [AmbassadorDashboardController::class, 'leaderboard']);
        Route::get('/me/profile', [AmbassadorDashboardController::class, 'profile']);
        Route::put('/me/profile', [AmbassadorDashboardController::class, 'updateProfile']);
        Route::get('/me/referral-link', [AmbassadorDashboardController::class, 'referralLink']);
        Route::get('/me/referrals', [AmbassadorDashboardController::class, 'referrals']);
        Route::get('/me/commissions', [AmbassadorDashboardController::class, 'commissions']);
        Route::get('/me/payouts', [AmbassadorDashboardController::class, 'payouts']);
        Route::get('/me/payout-eligibility', [AmbassadorDashboardController::class, 'payoutEligibility']);
        Route::post('/me/payout-requests', [AmbassadorDashboardController::class, 'requestPayout'])->middleware('throttle:5,60');
        Route::get('/me/notifications', [AmbassadorDashboardController::class, 'notifications']);
        Route::post('/me/notifications/read-all', [AmbassadorDashboardController::class, 'markAllNotificationsRead']);
        Route::post('/me/notifications/{notificationId}/read', [AmbassadorDashboardController::class, 'markNotificationRead']);

        Route::middleware('admin')->prefix('admin')->group(function (): void {
            Route::get('overview', AdminOverviewController::class);
            Route::apiResource('commission-rules', CommissionRuleController::class);
            Route::apiResource('formation-pricings', FormationPricingController::class)->except(['show']);
            Route::get('commissions', [CommissionProcessController::class, 'index']);
            Route::get('commissions/export', [CommissionProcessController::class, 'exportCsv']);
            Route::post('commissions/generate', [CommissionProcessController::class, 'generate']);
            Route::post('commissions/{commission}/approve', [CommissionProcessController::class, 'approve']);
            Route::get('payouts', [PayoutController::class, 'index']);
            Route::get('payouts/export', [PayoutController::class, 'exportCsv']);
            Route::post('payouts/trigger', [PayoutController::class, 'trigger']);
            Route::get('payout-runs', [PayoutRunController::class, 'index']);
            Route::get('challenges', [ChallengeController::class, 'index']);
            Route::post('challenges', [ChallengeController::class, 'store']);
        });
    });
});
