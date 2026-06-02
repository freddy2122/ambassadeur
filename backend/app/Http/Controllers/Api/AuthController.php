<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReferralLink;
use App\Models\User;
use App\Notifications\PlatformNotification;
use App\Services\AmbassadorRegistrationService;
use App\Services\EmailVerificationCodeService;
use Illuminate\Contracts\Auth\PasswordBroker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        protected AmbassadorRegistrationService $ambassadorRegistration,
        protected EmailVerificationCodeService $verificationCode,
    ) {}

    public function register(Request $request)
    {
        $request->merge([
            'email' => Str::lower(trim((string) $request->input('email', ''))),
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['required', 'regex:/^(?:01\d{8}|\+\d{8,15})$/'],
            'referral_code' => ['nullable', 'string', 'max:32'],
        ]);

        $referralLink = isset($validated['referral_code'])
            ? ReferralLink::where('code', strtoupper($validated['referral_code']))->first()
            : null;

        if (isset($validated['referral_code']) && ! $referralLink) {
            throw ValidationException::withMessages([
                'referral_code' => ['Code de parrainage invalide.'],
            ]);
        }

        ['user' => $user, 'referral_link' => $personalReferralLink] = $this->ambassadorRegistration->registerAmbassador($validated);

        $code = $this->verificationCode->generateAndStore($user);
        $this->verificationCode->send($user, $code);
        $user->notify(new PlatformNotification(
            'Bienvenue sur EIG Ambassadeur',
            'Votre compte a été créé. Vérifiez votre email avec le code à 6 chiffres pour activer votre espace.',
            rtrim((string) config('app.frontend_url', config('app.url')), '/').'/verification?email='.urlencode($user->email)
        ));

        return response()->json([
            'user' => $user,
            'referral_link' => $personalReferralLink,
            'message' => 'Compte créé. Un code de validation à 6 chiffres a été envoyé.',
            'requires_verification' => true,
            'debug_verification_code' => config('app.debug') ? $code : null,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->merge([
            'email' => Str::lower(trim((string) $request->input('email', ''))),
        ]);

        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $emailNormalized = $credentials['email'];

        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$emailNormalized])
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont invalides.'],
            ]);
        }

        if ($user->role === 'ambassador' && $user->email_verified_at === null) {
            $code = $this->verificationCode->generateAndStore($user);
            $this->verificationCode->send($user, $code);

            return response()->json([
                'message' => 'Votre compte doit être validé. Un nouveau code vous a été envoyé.',
                'requires_verification' => true,
                'debug_verification_code' => config('app.debug') ? $code : null,
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->merge([
            'email' => Str::lower(trim((string) $request->input('email', ''))),
        ]);

        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$validated['email']])
            ->first();

        if (! $user) {
            return response()->json([
                'message' => 'Si cet email existe, un lien de réinitialisation a été envoyé.',
            ]);
        }

        /** @var PasswordBroker $passwordBroker */
        $passwordBroker = Password::broker();
        $token = $passwordBroker->createToken($user);
        $frontendBaseUrl = rtrim((string) config('app.frontend_url', config('app.url')), '/');
        $resetUrl = $frontendBaseUrl.'/reinitialiser-mot-de-passe?token='.urlencode($token).'&email='.urlencode($user->email);

        Mail::raw(
            "Vous avez demandé une réinitialisation de mot de passe.\n\nLien: {$resetUrl}\n\nCe lien expire conformément à la configuration de sécurité.",
            static function ($message) use ($user): void {
                $message->to($user->email)->subject('Réinitialisation du mot de passe');
            }
        );

        return response()->json([
            'message' => 'Un lien de réinitialisation a été envoyé.',
            'debug_reset_token' => config('app.debug') ? $token : null,
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->merge([
            'email' => Str::lower(trim((string) $request->input('email', ''))),
        ]);

        $validated = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        /** @var PasswordBroker $passwordBroker */
        $passwordBroker = Password::broker();

        $status = $passwordBroker->reset(
            [
                'email' => $validated['email'],
                'token' => $validated['token'],
                'password' => $validated['password'],
                'password_confirmation' => $request->input('password_confirmation'),
            ],
            static function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        $user = User::query()->whereRaw('LOWER(email) = ?', [$validated['email']])->first();
        if ($user) {
            $user->notify(new PlatformNotification(
                'Mot de passe réinitialisé',
                'Votre mot de passe a été modifié. Si ce n’est pas vous, contactez immédiatement le support.'
            ));
        }

        return response()->json([
            'message' => 'Mot de passe réinitialisé avec succès.',
        ]);
    }

    public function verifyCode(Request $request)
    {
        $request->merge([
            'email' => Str::lower(trim((string) $request->input('email', ''))),
        ]);

        $validated = $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'digits:6'],
        ]);

        $emailNormalized = $validated['email'];

        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$emailNormalized])
            ->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['Aucun compte trouvé pour cet email.'],
            ]);
        }

        $this->verificationCode->verifySixDigit($user, $validated['code']);
        $user->notify(new PlatformNotification(
            'Compte vérifié',
            'Votre compte est maintenant vérifié et prêt à être utilisé.'
        ));

        $token = $user->fresh()->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Compte validé avec succès.',
            'user' => $user->fresh(),
            'token' => $token,
        ]);
    }

    public function resendCode(Request $request)
    {
        $request->merge([
            'email' => Str::lower(trim((string) $request->input('email', ''))),
        ]);

        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $emailNormalized = $validated['email'];

        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$emailNormalized])
            ->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['Aucun compte trouvé pour cet email.'],
            ]);
        }

        if ($user->email_verified_at !== null) {
            return response()->json([
                'message' => 'Ce compte est déjà validé.',
                'requires_verification' => false,
            ]);
        }

        $code = $this->verificationCode->generateAndStore($user);
        $this->verificationCode->send($user, $code);

        return response()->json([
            'message' => 'Un nouveau code a été envoyé.',
            'requires_verification' => true,
            'debug_verification_code' => config('app.debug') ? $code : null,
        ]);
    }
}
