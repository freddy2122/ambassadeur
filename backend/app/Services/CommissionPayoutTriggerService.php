<?php

namespace App\Services;

use App\Models\Commission;
use App\Models\Payout;
use Illuminate\Support\Collection;

class CommissionPayoutTriggerService
{
    public function __construct(
        private readonly FedaPayService $fedaPayService,
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

        foreach ($commissions as $commission) {
            $ambassador = $commission->ambassador;
            $profile = $ambassador?->ambassadorProfile;

            $transferPayload = [
                'description' => 'Commission ambassadeur '.$commission->period_month,
                'amount' => (float) $commission->gross_amount,
                'currency' => $curr,
                'customer' => [
                    'name' => $ambassador?->name,
                    'email' => $ambassador?->email,
                    'phone' => $profile?->phone,
                ],
            ];

            $providerResponse = $this->fedaPayService->createTransfer($transferPayload);

            $payout = Payout::query()->create([
                'ambassador_id' => $commission->ambassador_id,
                'commission_id' => $commission->id,
                'amount' => $commission->gross_amount,
                'method' => 'fedapay',
                'status' => $providerResponse['status'] === 'failed' ? 'failed' : 'processing',
                'provider_reference' => $providerResponse['provider_reference'],
                'provider_payload' => $providerResponse['raw'],
            ]);

            $commission->update([
                'status' => $payout->status === 'failed' ? 'payment_failed' : 'in_payment',
            ]);

            $out[] = $payout;
        }

        return $out;
    }
}
