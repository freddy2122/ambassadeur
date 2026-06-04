<?php

namespace App\Services;

use App\Models\ReferralLink;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AmbassadorRegistrationService
{
    public function registerAmbassador(array $validated): array
    {
        return DB::transaction(function () use ($validated): array {
            $referrer = null;

            if (! empty($validated['referral_code'])) {
                $referrer = ReferralLink::query()
                    ->where('code', strtoupper((string) $validated['referral_code']))
                    ->first();
            }

            $user = User::query()->create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'role' => 'ambassador',
                'referred_by_user_id' => $referrer?->ambassador_id,
            ]);

            $user->ambassadorProfile()->create([
                'phone' => $validated['phone'],
                'status' => 'active',
                'onboarding_step' => 'registered',
            ]);

            $referralCode = $this->generateUniqueReferralCode($user->id);

            $personalReferralLink = ReferralLink::query()->create([
                'ambassador_id' => $user->id,
                'code' => $referralCode,
                'destination_url' => rtrim((string) config('app.frontend_url', config('app.url')), '/').'/formations?ref='.$referralCode,
            ]);

            return [
                'user' => $user,
                'referral_link' => $personalReferralLink,
            ];
        });
    }

    protected function generateUniqueReferralCode(int $userId): string
    {
        $code = 'AMB-'.str_pad((string) $userId, 3, '0', STR_PAD_LEFT);

        if (ReferralLink::query()->where('code', $code)->exists()) {
            do {
                $code = 'AMB-'.strtoupper(Str::random(6));
            } while (ReferralLink::query()->where('code', $code)->exists());
        }

        return $code;
    }
}
