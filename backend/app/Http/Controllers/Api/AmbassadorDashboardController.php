<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\Payout;
use App\Services\AmbassadorInsightsService;
use App\Services\AmbassadorTierService;
use App\Services\CommissionPayoutTriggerService;
use App\Notifications\PlatformNotification;
use App\Services\EmailVerificationCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AmbassadorDashboardController extends Controller
{
    public function __construct(
        protected EmailVerificationCodeService $verificationCode,
        protected CommissionPayoutTriggerService $commissionPayoutTrigger,
        protected AmbassadorInsightsService $insights,
        protected AmbassadorTierService $tierService,
    ) {}

    public function profile(Request $request)
    {
        $user = $request->user()->load('ambassadorProfile', 'referralLinks');
        $validatedCount = $user->enrollments()->whereNotNull('validated_at')->count();
        $earnings = $this->insights->earningsBreakdown($user->id);
        $tier = $this->tierService->tierProgress($validatedCount);
        $referralCode = $user->referralLinks()->latest()->first()?->code;

        return response()->json([
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'email_verified' => $user->email_verified_at !== null,
                'phone' => $user->ambassadorProfile?->phone,
                'bio' => $user->ambassadorProfile?->bio,
                'payment_method' => $user->ambassadorProfile?->payment_method,
                'payment_account' => $user->ambassadorProfile?->payment_account,
                'payment_account_holder' => $user->ambassadorProfile?->payment_account_holder,
                'payment_bank_code' => $user->ambassadorProfile?->payment_bank_code,
                'referral_code' => $referralCode,
                'validated_enrollments' => $validatedCount,
                'total_earnings' => $earnings['available'] + $earnings['pending'] + $earnings['paid'],
                'tier' => $tier['current_tier'],
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $request->merge([
            'email' => Str::lower(trim((string) $request->input('email', ''))),
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'payment_method' => ['nullable', 'string', 'max:100'],
            'payment_account' => ['nullable', 'string', 'max:255'],
            'payment_account_holder' => ['nullable', 'string', 'max:255'],
            'payment_bank_code' => ['nullable', 'string', 'max:20'],
        ]);

        $emailChanged = $validated['email'] !== $user->email;

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'email_verified_at' => $emailChanged ? null : $user->email_verified_at,
        ]);

        $user->ambassadorProfile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'phone' => $validated['phone'] ?? null,
                'bio' => $validated['bio'] ?? null,
                'payment_method' => $validated['payment_method'] ?? null,
                'payment_account' => $validated['payment_account'] ?? null,
                'payment_account_holder' => $validated['payment_account_holder'] ?? null,
                'payment_bank_code' => $validated['payment_bank_code'] ?? null,
            ]
        );

        if ($emailChanged) {
            $code = $this->verificationCode->generateAndStore($user->fresh());
            $this->verificationCode->send($user->fresh(), $code);
            $user->notify(new PlatformNotification(
                'Nouvel email à vérifier',
                'Votre email a été modifié. Vérifiez-le avec le code à 6 chiffres envoyé.',
                rtrim((string) config('app.frontend_url', config('app.url')), '/').'/verification?email='.urlencode($validated['email'])
            ));

            return response()->json([
                'message' => 'Profil mis à jour. Votre nouvel email doit être vérifié.',
                'requires_verification' => true,
                'email' => $validated['email'],
                'debug_verification_code' => config('app.debug') ? $code : null,
            ]);
        }

        return response()->json([
            'message' => 'Profil mis à jour.',
            'requires_verification' => false,
        ]);
    }

    public function notifications(Request $request)
    {
        $user = $request->user();
        $notifications = $user->notifications()->latest()->limit(20)->get()->map(function ($notification) {
            return [
                'id' => $notification->id,
                'title' => $notification->data['title'] ?? 'Notification',
                'message' => $notification->data['message'] ?? '',
                'action_url' => $notification->data['action_url'] ?? null,
                'read_at' => $notification->read_at,
                'created_at' => $notification->created_at,
            ];
        });

        return response()->json([
            'unread_count' => $user->unreadNotifications()->count(),
            'notifications' => $notifications,
        ]);
    }

    public function markNotificationRead(Request $request, string $notificationId)
    {
        $notification = $request->user()->notifications()->where('id', $notificationId)->firstOrFail();
        if (! $notification->read_at) {
            $notification->markAsRead();
        }

        return response()->json([
            'message' => 'Notification marquée comme lue.',
        ]);
    }

    public function markAllNotificationsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json([
            'message' => 'Toutes les notifications ont été marquées comme lues.',
        ]);
    }

    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'ambassador' && ! $user->ambassadorProfile) {
            $user->ambassadorProfile()->create([
                'status' => 'active',
                'onboarding_step' => 'legacy',
            ]);
            $user->load('ambassadorProfile');
        }

        $referralLink = $user->referralLinks()->latest()->first();

        $clicks = $referralLink?->clicks()->count() ?? 0;
        $leads = $referralLink?->leads()->count() ?? 0;
        $validatedEnrollments = $user->enrollments()->whereNotNull('validated_at')->count();
        $totalCommission = Commission::where('ambassador_id', $user->id)->sum('gross_amount');
        $rankData = $this->insights->rankForAmbassador($user->id);
        $earnings = $this->insights->earningsBreakdown($user->id);
        $tier = $this->tierService->tierProgress($validatedEnrollments);
        $frontendBase = rtrim((string) config('app.frontend_url', config('app.url')), '/');
        $referralCode = $referralLink?->code;
        $personalUrl = $referralCode
            ? $frontendBase.'/formations?ref='.urlencode($referralCode)
            : null;

        return response()->json([
            'profile' => [
                'name' => $user->name,
                'first_name' => $this->insights->firstName((string) $user->name),
            ],
            'kpis' => [
                'clicks' => $clicks,
                'leads' => $leads,
                'prospects' => $leads,
                'validated_enrollments' => $validatedEnrollments,
                'total_commission' => (float) $totalCommission,
                'available_earnings' => $earnings['available'],
                'rank' => $rankData['rank'],
            ],
            'referral' => [
                'code' => $referralCode,
                'personal_url' => $personalUrl,
                'display_url' => $personalUrl,
            ],
            'tier' => $tier,
            'earnings' => $earnings,
            'challenge' => $this->insights->activeChallengeForAmbassador($user->id),
        ]);
    }

    public function leaderboard(Request $request)
    {
        $user = $request->user();
        $limit = min(50, max(5, (int) $request->integer('limit', 20)));
        $leaderboard = $this->insights->leaderboard($limit);
        $rankData = $this->insights->rankForAmbassador($user->id);

        return response()->json([
            'leaderboard' => $leaderboard,
            'me' => [
                'id' => $user->id,
                'name' => $user->name,
                'first_name' => $this->insights->firstName((string) $user->name),
                'rank' => $rankData['rank'],
                'validated_enrollments' => $rankData['validated_enrollments'],
            ],
        ]);
    }

    public function referralLink(Request $request)
    {
        return response()->json([
            'referral_link' => $request->user()->referralLinks()->latest()->first(),
        ]);
    }

    public function referrals(Request $request)
    {
        $referralLink = $request->user()->referralLinks()->latest()->first();
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'max:50'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $perPage = (int) ($validated['per_page'] ?? 10);
        $leadQuery = $referralLink?->leads()->latest();

        if ($leadQuery && ! empty($validated['status'])) {
            $leadQuery->where('status', $validated['status']);
        }
        if ($leadQuery && ! empty($validated['date_from'])) {
            $leadQuery->whereDate('created_at', '>=', $validated['date_from']);
        }
        if ($leadQuery && ! empty($validated['date_to'])) {
            $leadQuery->whereDate('created_at', '<=', $validated['date_to']);
        }

        $leads = $leadQuery ? $leadQuery->paginate($perPage) : null;

        return response()->json([
            'clicks' => $referralLink?->clicks()->latest()->limit(50)->get() ?? [],
            'leads' => $leads?->items() ?? [],
            'meta' => [
                'current_page' => $leads?->currentPage() ?? 1,
                'last_page' => $leads?->lastPage() ?? 1,
                'per_page' => $leads?->perPage() ?? $perPage,
                'total' => $leads?->total() ?? 0,
            ],
        ]);
    }

    public function commissions(Request $request)
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'max:50'],
            'period_month' => ['nullable', 'string', 'max:20'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'sort_by' => ['nullable', 'string'],
            'sort_dir' => ['nullable', 'in:asc,desc'],
        ]);

        $perPage = (int) ($validated['per_page'] ?? 10);
        $sortBy = $validated['sort_by'] ?? 'created_at';
        $sortDir = $validated['sort_dir'] ?? 'desc';
        $allowedSorts = ['created_at', 'gross_amount', 'validated_enrollments', 'period_month', 'status'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'created_at';
        }

        $query = Commission::where('ambassador_id', $request->user()->id);
        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }
        if (! empty($validated['period_month'])) {
            $query->where('period_month', $validated['period_month']);
        }

        $commissions = $query->orderBy($sortBy, $sortDir)->paginate($perPage);

        return response()->json([
            'commissions' => $commissions->items(),
            'meta' => [
                'current_page' => $commissions->currentPage(),
                'last_page' => $commissions->lastPage(),
                'per_page' => $commissions->perPage(),
                'total' => $commissions->total(),
            ],
        ]);
    }

    public function payouts(Request $request)
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'max:50'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $perPage = (int) ($validated['per_page'] ?? 10);
        $query = Payout::where('ambassador_id', $request->user()->id)->latest();

        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }
        if (! empty($validated['date_from'])) {
            $query->whereDate('created_at', '>=', $validated['date_from']);
        }
        if (! empty($validated['date_to'])) {
            $query->whereDate('created_at', '<=', $validated['date_to']);
        }

        $payouts = $query->paginate($perPage);

        return response()->json([
            'payouts' => $payouts->items(),
            'meta' => [
                'current_page' => $payouts->currentPage(),
                'last_page' => $payouts->lastPage(),
                'per_page' => $payouts->perPage(),
                'total' => $payouts->total(),
            ],
        ]);
    }

    public function earnings(Request $request)
    {
        $user = $request->user();
        $limit = min(50, max(5, (int) $request->integer('limit', 30)));

        return response()->json([
            'earnings' => $this->insights->earningsBreakdown($user->id),
            'history' => $this->insights->earningsHistory($user->id, $limit),
        ]);
    }

    /**
     * Commissions approuvées éligibles au même processus que /admin/payouts/trigger (FedaPay transferts).
     */
    public function payoutEligibility(Request $request)
    {
        $user = $request->user()->loadMissing('ambassadorProfile');
        $requireEmail = (bool) config('services.payout.auto_require_verified_email', true);

        $eligible = Commission::query()
            ->where('ambassador_id', $user->id)
            ->where('status', 'approved')
            ->orderByDesc('created_at')
            ->get()
            ->filter(static function (Commission $c): bool {
                return ! Payout::query()
                    ->where('commission_id', $c->id)
                    ->where('status', '!=', 'failed')
                    ->exists();
            })
            ->values();

        $profile = $user->ambassadorProfile;
        $phone = $profile?->payment_account ?: $profile?->phone;
        $paymentReady = filled($phone);
        $earnings = $this->insights->earningsBreakdown($user->id);

        return response()->json([
            'earnings' => $earnings,
            'eligible_count' => $eligible->count(),
            'eligible_total_xof' => (float) $eligible->sum('gross_amount'),
            'commissions' => $eligible->map(fn (Commission $c) => [
                'id' => $c->id,
                'period_month' => $c->period_month,
                'gross_amount' => $c->gross_amount,
            ]),
            'payment_profile' => [
                'payment_method' => $profile?->payment_method,
                'payment_account' => $profile?->payment_account,
                'payment_account_holder' => $profile?->payment_account_holder,
                'phone' => $profile?->phone,
            ],
            'blockers' => [
                'email_verification_required' => $requireEmail && $user->email_verified_at === null,
                'payment_profile_incomplete' => ! $paymentReady,
            ],
        ]);
    }

    public function requestPayout(Request $request)
    {
        $user = $request->user()->loadMissing('ambassadorProfile');

        if (config('services.payout.auto_require_verified_email', true) && $user->email_verified_at === null) {
            return response()->json([
                'message' => 'Vérifiez votre adresse e-mail avant de demander un retrait.',
            ], 422);
        }

        $validated = $request->validate([
            'amount' => ['nullable', 'numeric', 'min:1'],
            'payment_method' => ['nullable', 'string', 'in:mtn,moov,celtiis'],
            'payment_account' => ['nullable', 'string', 'max:30'],
            'payment_account_holder' => ['nullable', 'string', 'max:255'],
            'account_holder_name' => ['nullable', 'string', 'max:255'],
            'commission_ids' => ['nullable', 'array', 'max:80'],
            'commission_ids.*' => ['integer', 'distinct'],
            'currency' => ['nullable', 'string', 'max:10'],
        ]);

        $holderName = $validated['payment_account_holder'] ?? $validated['account_holder_name'] ?? null;
        $paymentAccount = $validated['payment_account'] ?? null;

        if ($paymentAccount || $validated['payment_method'] ?? null || $holderName) {
            $user->ambassadorProfile()->updateOrCreate(
                ['user_id' => $user->id],
                array_filter([
                    'payment_method' => $validated['payment_method'] ?? null,
                    'payment_account' => $paymentAccount,
                    'payment_account_holder' => $holderName,
                    'phone' => $paymentAccount ?: $user->ambassadorProfile?->phone,
                ], static fn ($value) => $value !== null)
            );
            $user->load('ambassadorProfile');
        }

        $profile = $user->ambassadorProfile;
        $phone = $profile?->payment_account ?: $profile?->phone;

        if (! filled($phone)) {
            return response()->json([
                'message' => 'Indiquez un numéro Mobile Money pour recevoir votre retrait.',
            ], 422);
        }

        $commissionQuery = Commission::query()
            ->where('ambassador_id', $user->id)
            ->where('status', 'approved')
            ->with(['ambassador.ambassadorProfile']);

        if (! empty($validated['commission_ids'])) {
            $commissionQuery->whereIn('id', $validated['commission_ids']);
        }

        /** @var \Illuminate\Support\Collection<int, Commission> $eligible */
        $eligible = $commissionQuery->orderBy('created_at')->get()->filter(static function (Commission $c): bool {
            return ! Payout::query()
                ->where('commission_id', $c->id)
                ->where('status', '!=', 'failed')
                ->exists();
        })->values();

        if ($eligible->isEmpty()) {
            return response()->json([
                'message' => 'Aucune commission au statut « approuvé » disponible pour un retrait.',
            ], 422);
        }

        $eligibleTotal = (float) $eligible->sum('gross_amount');
        $requestedAmount = isset($validated['amount']) ? (float) $validated['amount'] : $eligibleTotal;

        if ($requestedAmount > $eligibleTotal + 0.01) {
            return response()->json([
                'message' => 'Le montant demandé dépasse votre solde disponible.',
            ], 422);
        }

        $selected = $this->selectCommissionsForAmount($eligible, $requestedAmount);

        if ($selected->isEmpty()) {
            return response()->json([
                'message' => 'Impossible de traiter ce montant. Retirez le solde complet disponible.',
            ], 422);
        }

        $payouts = $this->commissionPayoutTrigger->triggerBatch($selected, $validated['currency'] ?? null);

        return response()->json([
            'message' => 'Votre demande de retrait a été envoyée. Vous serez notifié une fois le paiement traité.',
            'count' => count($payouts),
            'amount' => (float) $selected->sum('gross_amount'),
            'data' => $payouts,
        ]);
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Commission>  $eligible
     * @return \Illuminate\Support\Collection<int, Commission>
     */
    protected function selectCommissionsForAmount($eligible, float $amount)
    {
        $selected = collect();
        $sum = 0.0;

        foreach ($eligible as $commission) {
            if ($sum >= $amount - 0.01) {
                break;
            }
            $selected->push($commission);
            $sum += (float) $commission->gross_amount;
        }

        if ($sum + 0.01 < $amount) {
            return collect();
        }

        return $selected;
    }
}
