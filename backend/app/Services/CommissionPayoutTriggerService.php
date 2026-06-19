<?php

namespace App\Services;

use App\Models\Commission;
use App\Models\Payout;
use Illuminate\Support\Collection;

class CommissionPayoutTriggerService
{
    public function __construct(
        private readonly PayoutProviderService $payoutProvider,
    ) {}

    /**
     * Un virement par commission (statut attendu : approved côté métier).
     *
     * @param  Collection<int, Commission>  $commissions
     * @return array<int, Payout>
     */
    public function triggerBatch(Collection $commissions, ?string $currency = null): array
    {
        $out = [];
        $curr = $currency ?? 'XOF';
        $method = $this->payoutProvider->method();

        foreach ($commissions as $commission) {
            $ambassador = $commission->ambassador;
            $profile = $ambassador?->ambassadorProfile;

            $transferPayload = [
                'description' => 'Commission ambassadeur '.$commission->period_month,
                'amount' => (float) $commission->gross_amount,
                'currency' => $curr,
                'payment_method' => $profile?->payment_method,
                'idempotency_key' => 'commission-'.$commission->id,
                'metadata' => [
                    'commission_id' => $commission->id,
                    'ambassador_id' => $commission->ambassador_id,
                ],
                'customer' => [
                    'name' => $ambassador?->name,
                    'email' => $ambassador?->email,
                    'phone' => $profile?->payment_account ?: $profile?->phone,
                ],
            ];

            $providerResponse = $this->payoutProvider->createTransfer($transferPayload);
            $status = $providerResponse['status'] ?? 'processing';
            $payoutStatus = $status === 'failed' ? 'failed' : ($status === 'paid' ? 'paid' : 'processing');

            $payout = Payout::query()->create([
                'ambassador_id' => $commission->ambassador_id,
                'commission_id' => $commission->id,
                'amount' => $commission->gross_amount,
                'method' => $method,
                'status' => $payoutStatus,
                'provider_reference' => $providerResponse['provider_reference'],
                'provider_payload' => $providerResponse['raw'],
                'paid_at' => $payoutStatus === 'paid' ? now() : null,
            ]);

            $commission->update([
                'status' => match ($payoutStatus) {
                    'failed' => 'payment_failed',
                    'paid' => 'paid',
                    default => 'in_payment',
                },
            ]);

            $out[] = $payout;
        }

        return $out;
    }
}
