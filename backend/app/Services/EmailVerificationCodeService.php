<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class EmailVerificationCodeService
{
    protected const MAX_ATTEMPTS = 5;
    protected const LOCK_MINUTES = 15;

    public function generateAndStore(User $user): string
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user->forceFill([
            'verification_code' => $code,
            'verification_code_expires_at' => Carbon::now()->addMinutes(10),
            'verification_attempts' => 0,
            'verification_locked_until' => null,
        ])->save();

        return $code;
    }

    public function verifySixDigit(User $user, string $code): void
    {
        $lockedUntil = $user->verification_locked_until;
        if ($lockedUntil && Carbon::parse($lockedUntil)->isFuture()) {
            throw ValidationException::withMessages([
                'code' => ['Trop de tentatives. Réessayez plus tard.'],
            ]);
        }

        if ($user->verification_code !== $code) {
            $attempts = ((int) $user->verification_attempts) + 1;
            $payload = ['verification_attempts' => $attempts];

            if ($attempts >= self::MAX_ATTEMPTS) {
                $payload['verification_locked_until'] = Carbon::now()->addMinutes(self::LOCK_MINUTES);
                $payload['verification_attempts'] = 0;
            }

            $user->forceFill($payload)->save();

            throw ValidationException::withMessages([
                'code' => ['Code de vérification invalide.'],
            ]);
        }

        $expiresAt = $user->verification_code_expires_at;
        if (! $expiresAt || Carbon::parse($expiresAt)->isPast()) {
            throw ValidationException::withMessages([
                'code' => ['Code expiré. Veuillez en demander un nouveau.'],
            ]);
        }

        $user->forceFill([
            'email_verified_at' => Carbon::now(),
            'verification_code' => null,
            'verification_code_expires_at' => null,
            'verification_attempts' => 0,
            'verification_locked_until' => null,
        ])->save();
    }

    public function send(User $user, string $code): void
    {
        Mail::raw(
            "Votre code de vérification EIG est : {$code}. Ce code expire dans 10 minutes.",
            static function ($message) use ($user): void {
                $message->to($user->email)->subject('Code de vérification EIG');
            }
        );
    }
}
