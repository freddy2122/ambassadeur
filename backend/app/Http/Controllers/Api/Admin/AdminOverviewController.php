<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\Enrollment;
use App\Models\Lead;
use App\Models\Payout;
use App\Models\ReferralClick;
use App\Models\ReferralLink;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminOverviewController extends Controller
{
    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $leadsSub = ReferralLink::query()
            ->leftJoin('leads', 'leads.referral_link_id', '=', 'referral_links.id')
            ->selectRaw('referral_links.ambassador_id, COUNT(leads.id) as leads_count')
            ->groupBy('referral_links.ambassador_id');

        $clicksSub = ReferralLink::query()
            ->leftJoin('referral_clicks', 'referral_clicks.referral_link_id', '=', 'referral_links.id')
            ->selectRaw('referral_links.ambassador_id, COUNT(referral_clicks.id) as clicks_count')
            ->groupBy('referral_links.ambassador_id');

        $enrollmentsSub = Enrollment::query()
            ->selectRaw('ambassador_id, COUNT(id) as enrollments_count, SUM(CASE WHEN validated_at IS NOT NULL THEN 1 ELSE 0 END) as validated_enrollments')
            ->groupBy('ambassador_id');

        $commissionsSub = Commission::query()
            ->selectRaw('ambassador_id, COUNT(id) as commissions_count, SUM(gross_amount) as commissions_total')
            ->groupBy('ambassador_id');

        $payoutsSub = Payout::query()
            ->selectRaw('ambassador_id, COUNT(id) as payouts_count, SUM(amount) as payouts_total')
            ->groupBy('ambassador_id');

        $partnersBaseQuery = User::query()
            ->where(function ($inner): void {
                $inner->whereNull('role')
                    ->orWhere('role', '!=', 'admin');
            });

        $query = (clone $partnersBaseQuery)
            ->leftJoinSub($leadsSub, 'lead_stats', 'lead_stats.ambassador_id', '=', 'users.id')
            ->leftJoinSub($clicksSub, 'click_stats', 'click_stats.ambassador_id', '=', 'users.id')
            ->leftJoinSub($enrollmentsSub, 'enrollment_stats', 'enrollment_stats.ambassador_id', '=', 'users.id')
            ->leftJoinSub($commissionsSub, 'commission_stats', 'commission_stats.ambassador_id', '=', 'users.id')
            ->leftJoinSub($payoutsSub, 'payout_stats', 'payout_stats.ambassador_id', '=', 'users.id')
            ->select([
                'users.id',
                'users.name',
                'users.email',
                'users.role',
                'users.email_verified_at',
                'users.created_at',
                DB::raw('COALESCE(lead_stats.leads_count, 0) as leads_count'),
                DB::raw('COALESCE(click_stats.clicks_count, 0) as clicks_count'),
                DB::raw('COALESCE(enrollment_stats.enrollments_count, 0) as enrollments_count'),
                DB::raw('COALESCE(enrollment_stats.validated_enrollments, 0) as validated_enrollments'),
                DB::raw('COALESCE(commission_stats.commissions_count, 0) as commissions_count'),
                DB::raw('COALESCE(commission_stats.commissions_total, 0) as commissions_total'),
                DB::raw('COALESCE(payout_stats.payouts_count, 0) as payouts_count'),
                DB::raw('COALESCE(payout_stats.payouts_total, 0) as payouts_total'),
            ])
            ->orderByDesc('users.created_at');

        if (! empty($validated['search'])) {
            $search = '%'.$validated['search'].'%';
            $query->where(function ($inner) use ($search): void {
                $inner->where('users.name', 'like', $search)
                    ->orWhere('users.email', 'like', $search);
            });
        }

        $perPage = (int) ($validated['per_page'] ?? 10);
        $ambassadors = $query->paginate($perPage);

        return response()->json([
            'kpis' => [
                'ambassadors_total' => (clone $partnersBaseQuery)->count(),
                'leads_total' => Lead::query()->count(),
                'clicks_total' => ReferralClick::query()->count(),
                'validated_enrollments_total' => Enrollment::query()->whereNotNull('validated_at')->count(),
                'commissions_total_amount' => (float) Commission::query()->sum('gross_amount'),
                'payouts_total_amount' => (float) Payout::query()->sum('amount'),
            ],
            'ambassadors' => $ambassadors->items(),
            'meta' => [
                'current_page' => $ambassadors->currentPage(),
                'last_page' => $ambassadors->lastPage(),
                'per_page' => $ambassadors->perPage(),
                'total' => $ambassadors->total(),
            ],
        ]);
    }
}
