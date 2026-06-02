<?php

use App\Models\Commission;
use App\Models\Payout;
use App\Models\PayoutRun;
use App\Notifications\PlatformNotification;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Services\CommissionService;
use App\Services\FedaPayService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('commissions:generate {periodMonth?}', function (CommissionService $commissionService): void {
    $periodMonth = $this->argument('periodMonth') ?? now()->format('Y-m');
    $commissions = $commissionService->generateForMonth($periodMonth);

    $this->info('Commissions generated for '.$periodMonth.': '.$commissions->count());
})->purpose('Generate ambassador commissions for a month');

Artisan::command('payouts:auto-run {periodMonth?}', function (
    CommissionService $commissionService,
    FedaPayService $fedaPayService,
): void {
    $run = PayoutRun::query()->create([
        'command' => 'payouts:auto-run',
        'period_month' => (string) ($this->argument('periodMonth') ?? now()->format('Y-m')),
        'status' => 'running',
        'started_at' => now(),
    ]);

    $enabled = (bool) config('services.payout.auto_enabled', false);
    if (! $enabled) {
        $run->update([
            'status' => 'skipped',
            'error_message' => 'PAYOUT_AUTO_ENABLED=false',
            'finished_at' => now(),
        ]);
        $this->warn('Auto payouts desactives (PAYOUT_AUTO_ENABLED=false).');

        return;
    }

    $periodMonth = $this->argument('periodMonth') ?? now()->format('Y-m');
    $minAmount = (float) config('services.payout.auto_min_amount_xof', 0);
    $generateFirst = (bool) config('services.payout.auto_generate_commissions_first', true);
    $retryBaseMinutes = max(1, (int) config('services.payout.auto_retry_base_minutes', 30));

    if ($generateFirst) {
        $generated = $commissionService->generateForMonth($periodMonth);
        $this->info('Commissions generees/maj pour '.$periodMonth.' : '.$generated->count());
    }

    $eligibleStatuses = ['generated', 'pending', 'approved'];

    $commissions = Commission::query()
        ->where('period_month', $periodMonth)
        ->whereIn('status', $eligibleStatuses)
        ->where('gross_amount', '>=', $minAmount)
        ->with('ambassador.ambassadorProfile')
        ->get();

    if ($commissions->isEmpty()) {
        $run->update([
            'status' => 'done',
            'finished_at' => now(),
        ]);
        $this->info('Aucune commission eligible ce mois-ci.');

        return;
    }

    $success = 0;
    $failed = 0;
    $skipped = 0;

    foreach ($commissions as $commission) {
        $lock = Cache::lock('commission:payout:auto:'.$commission->id, 120);
        if (! $lock->get()) {
            $skipped++;
            continue;
        }

        try {
        $alreadyStarted = Payout::query()
            ->where('commission_id', $commission->id)
            ->where('status', '!=', 'failed')
            ->exists();

        if ($alreadyStarted) {
            $skipped++;
            continue;
        }

        $ambassador = $commission->ambassador;
        $profile = $ambassador?->ambassadorProfile;

        $kycRequired = (bool) config('services.payout.auto_require_verified_email', true);
        $needsVerifiedEmail = $kycRequired && $ambassador?->email_verified_at === null;
        $profileStatus = strtolower((string) ($profile?->status ?? 'pending'));
        $profileApproved = in_array($profileStatus, ['approved', 'active', 'verified'], true);
        $requiresProfileApproval = (bool) config('services.payout.auto_require_profile_approved', false);

        if (! $ambassador || ! $ambassador->email || ! $profile?->phone || $needsVerifiedEmail || ($requiresProfileApproval && ! $profileApproved)) {
            $skipped++;
            $this->warn('Commission #'.$commission->id.' ignoree (profil paiement incomplet).');
            continue;
        }

        $transferPayload = [
            'description' => 'Commission ambassadeur '.$commission->period_month,
            'amount' => (float) $commission->gross_amount,
            'currency' => 'XOF',
            'customer' => [
                'name' => $ambassador->name,
                'email' => $ambassador->email,
                'phone' => $profile->phone,
            ],
        ];

        $providerResponse = $fedaPayService->createTransfer($transferPayload);

        $payout = Payout::query()->create([
            'ambassador_id' => $commission->ambassador_id,
            'commission_id' => $commission->id,
            'amount' => $commission->gross_amount,
            'method' => 'fedapay',
            'status' => $providerResponse['status'] === 'failed' ? 'failed' : 'processing',
            'retry_count' => 0,
            'next_retry_at' => $providerResponse['status'] === 'failed' ? now()->addMinutes($retryBaseMinutes) : null,
            'last_error' => $providerResponse['status'] === 'failed' ? json_encode($providerResponse['raw'] ?? null) : null,
            'provider_reference' => $providerResponse['provider_reference'] ?? null,
            'provider_payload' => $providerResponse['raw'] ?? null,
        ]);

        $commission->update([
            'status' => $payout->status === 'failed' ? 'payment_failed' : 'in_payment',
        ]);

        if ($payout->status === 'failed') {
            $failed++;
            $this->error('Echec payout commission #'.$commission->id);
            $ambassador->notify(new PlatformNotification(
                'Retrait automatique échoué',
                'Le retrait automatique de votre commission '.$commission->period_month.' a échoué. Vérifiez vos informations de paiement.',
                rtrim((string) config('app.frontend_url', config('app.url')), '/').'/dashboard/paiements'
            ));
        } else {
            $success++;
            $this->info('Payout lance pour commission #'.$commission->id);
            $ambassador->notify(new PlatformNotification(
                'Retrait automatique lancé',
                'Votre retrait automatique de commission '.$commission->period_month.' a été lancé et est en cours de traitement.',
                rtrim((string) config('app.frontend_url', config('app.url')), '/').'/dashboard/paiements'
            ));
        }
        } finally {
            $lock->release();
        }
    }

    $run->update([
        'status' => 'done',
        'success_count' => $success,
        'failed_count' => $failed,
        'skipped_count' => $skipped,
        'finished_at' => now(),
    ]);

    $this->newLine();
    $this->info("Termine: success={$success}, failed={$failed}, skipped={$skipped}");
})->purpose('Run automatic payouts without admin approval');

Artisan::command('payouts:retry-failed', function (FedaPayService $fedaPayService): void {
    if (! (bool) config('services.payout.auto_retry_enabled', true)) {
        $this->warn('Retry desactive (PAYOUT_AUTO_RETRY_ENABLED=false).');

        return;
    }

    $maxAttempts = max(1, (int) config('services.payout.auto_retry_max_attempts', 4));
    $baseMinutes = max(1, (int) config('services.payout.auto_retry_base_minutes', 30));

    $retryables = Payout::query()
        ->where('status', 'failed')
        ->whereNotNull('commission_id')
        ->where('retry_count', '<', $maxAttempts)
        ->where(function ($q): void {
            $q->whereNull('next_retry_at')->orWhere('next_retry_at', '<=', now());
        })
        ->with(['ambassador.ambassadorProfile', 'commission'])
        ->limit(100)
        ->get();

    if ($retryables->isEmpty()) {
        $this->info('Aucun payout en echec a reessayer.');
        return;
    }

    $success = 0;
    $failed = 0;
    foreach ($retryables as $payout) {
        $lock = Cache::lock('payout:retry:'.$payout->id, 120);
        if (! $lock->get()) {
            continue;
        }

        try {
            $ambassador = $payout->ambassador;
            $profile = $ambassador?->ambassadorProfile;
            $commission = $payout->commission;
            if (! $ambassador || ! $commission || ! $profile?->phone) {
                continue;
            }

            $payload = [
                'description' => 'Retry commission ambassadeur '.$commission->period_month,
                'amount' => (float) $commission->gross_amount,
                'currency' => 'XOF',
                'customer' => [
                    'name' => $ambassador->name,
                    'email' => $ambassador->email,
                    'phone' => $profile->phone,
                ],
            ];

            $providerResponse = $fedaPayService->createTransfer($payload);

            $newRetryCount = (int) $payout->retry_count + 1;
            $isFailed = ($providerResponse['status'] ?? '') === 'failed';
            $nextRetryAt = $isFailed ? now()->addMinutes($baseMinutes * (2 ** max(0, $newRetryCount - 1))) : null;

            $payout->update([
                'status' => $isFailed ? 'failed' : 'processing',
                'retry_count' => $newRetryCount,
                'next_retry_at' => $nextRetryAt,
                'last_error' => $isFailed ? json_encode($providerResponse['raw'] ?? null) : null,
                'provider_reference' => $providerResponse['provider_reference'] ?? $payout->provider_reference,
                'provider_payload' => $providerResponse['raw'] ?? $payout->provider_payload,
            ]);

            $commission->update([
                'status' => $isFailed ? 'payment_failed' : 'in_payment',
            ]);

            if ($isFailed) {
                $failed++;
            } else {
                $success++;
            }
        } finally {
            $lock->release();
        }
    }

    $this->info("Retry termine: success={$success}, failed={$failed}");
})->purpose('Retry failed payouts with exponential backoff');

Artisan::command('payouts:reconcile', function (FedaPayService $fedaPayService): void {
    $run = PayoutRun::query()->create([
        'command' => 'payouts:reconcile',
        'status' => 'running',
        'started_at' => now(),
    ]);

    $processing = Payout::query()
        ->where('method', 'fedapay')
        ->where('status', 'processing')
        ->whereNotNull('provider_reference')
        ->with(['ambassador', 'commission'])
        ->limit(200)
        ->get();

    if ($processing->isEmpty()) {
        $run->update([
            'status' => 'done',
            'finished_at' => now(),
        ]);
        $this->info('Aucun payout processing a reconcilier.');

        return;
    }

    $paid = 0;
    $failed = 0;
    $unchanged = 0;

    foreach ($processing as $payout) {
        $lock = Cache::lock('payout:reconcile:'.$payout->id, 90);
        if (! $lock->get()) {
            $unchanged++;
            continue;
        }

        try {
        $providerId = (string) $payout->provider_reference;
        $transfer = ctype_digit($providerId) ? $fedaPayService->retrieveTransfer((int) $providerId) : null;
        if (! $transfer) {
            $unchanged++;
            continue;
        }

        $rawStatus = strtolower((string) ($transfer['status'] ?? ''));
        $isSuccess = in_array($rawStatus, ['approved', 'transferred', 'successful', 'success', 'completed'], true);
        $isFailure = in_array($rawStatus, ['failed', 'canceled', 'cancelled', 'rejected'], true);

        if (! $isSuccess && ! $isFailure) {
            $unchanged++;
            continue;
        }

        $payout->update([
            'status' => $isSuccess ? 'paid' : 'failed',
            'paid_at' => $isSuccess ? now() : null,
            'provider_payload' => $transfer,
        ]);

        if ($payout->commission) {
            $payout->commission->update([
                'status' => $isSuccess ? 'paid' : 'payment_failed',
            ]);
        }

        if ($payout->ambassador) {
            $payout->ambassador->notify(new PlatformNotification(
                $isSuccess ? 'Retrait confirmé' : 'Retrait échoué',
                $isSuccess
                    ? 'Votre retrait de commission a été confirmé par FedaPay.'
                    : 'Votre retrait de commission a été rejeté/échoué. Merci de vérifier vos informations de paiement.',
                rtrim((string) config('app.frontend_url', config('app.url')), '/').'/dashboard/paiements'
            ));
        }

        if ($isSuccess) {
            $paid++;
        } else {
            $failed++;
        }
        } finally {
            $lock->release();
        }
    }

    $run->update([
        'status' => 'done',
        'success_count' => $paid,
        'failed_count' => $failed,
        'unchanged_count' => $unchanged,
        'finished_at' => now(),
    ]);

    $this->info("Reconciliation terminee: paid={$paid}, failed={$failed}, unchanged={$unchanged}");
})->purpose('Reconcile processing payouts with provider status');

Schedule::command('payouts:auto-run')
    ->dailyAt((string) config('services.payout.auto_run_time', '02:00'))
    ->withoutOverlapping();

Schedule::command('payouts:reconcile')
    ->hourly()
    ->withoutOverlapping();

Schedule::command('payouts:retry-failed')
    ->everyThirtyMinutes()
    ->withoutOverlapping();
