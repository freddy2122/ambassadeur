<?php

namespace App\Services;

use App\Models\Challenge;
use App\Models\Commission;
use App\Models\CommissionRule;
use App\Models\Enrollment;
use App\Models\FormationPricing;
use App\Models\Payout;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AmbassadorInsightsService
{
    public function __construct(
        protected AmbassadorTierService $tierService,
    ) {}

    /**
     * @return array{
     *   rank: int,
     *   validated_enrollments: int
     * }
     */
    public function rankForAmbassador(int $ambassadorId): array
    {
        $counts = Enrollment::query()
            ->select('ambassador_id', DB::raw('COUNT(*) as validated_count'))
            ->whereNotNull('validated_at')
            ->groupBy('ambassador_id')
            ->orderByDesc('validated_count')
            ->orderBy('ambassador_id')
            ->get();

        $rank = 1;
        $previousCount = null;
        $position = 0;
        $ambassadorRank = $counts->count() + 1;
        $ambassadorCount = 0;

        foreach ($counts as $row) {
            $position++;
            if ($previousCount !== null && (int) $row->validated_count < $previousCount) {
                $rank = $position;
            }
            $previousCount = (int) $row->validated_count;

            if ((int) $row->ambassador_id === $ambassadorId) {
                $ambassadorRank = $rank;
                $ambassadorCount = (int) $row->validated_count;
                break;
            }
        }

        if ($ambassadorCount === 0) {
            $ambassadorCount = Enrollment::query()
                ->where('ambassador_id', $ambassadorId)
                ->whereNotNull('validated_at')
                ->count();
        }

        return [
            'rank' => $ambassadorRank,
            'validated_enrollments' => $ambassadorCount,
        ];
    }

    /**
     * @return array{
     *   available: float,
     *   pending: float,
     *   paid: float
     * }
     */
    public function earningsBreakdown(int $ambassadorId): array
    {
        $approvedAvailable = Commission::query()
            ->where('ambassador_id', $ambassadorId)
            ->where('status', 'approved')
            ->get()
            ->filter(static function (Commission $commission): bool {
                return ! Payout::query()
                    ->where('commission_id', $commission->id)
                    ->where('status', '!=', 'failed')
                    ->exists();
            })
            ->sum('gross_amount');

        $pendingCommissions = (float) Commission::query()
            ->where('ambassador_id', $ambassadorId)
            ->whereIn('status', ['generated', 'in_payment'])
            ->sum('gross_amount');

        $pendingPayouts = (float) Payout::query()
            ->where('ambassador_id', $ambassadorId)
            ->whereIn('status', ['processing', 'pending'])
            ->sum('amount');

        $paid = (float) Payout::query()
            ->where('ambassador_id', $ambassadorId)
            ->where('status', 'paid')
            ->sum('amount');

        return [
            'available' => (float) $approvedAvailable,
            'pending' => $pendingCommissions + $pendingPayouts,
            'paid' => $paid,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    public function activeChallengeForAmbassador(int $ambassadorId): ?array
    {
        $challenge = Challenge::query()->active()->latest('starts_at')->first();
        if (! $challenge) {
            return null;
        }

        $current = Enrollment::query()
            ->where('ambassador_id', $ambassadorId)
            ->whereNotNull('validated_at')
            ->whereBetween('validated_at', [$challenge->starts_at, $challenge->ends_at])
            ->count();

        return [
            'id' => $challenge->id,
            'title' => $challenge->title,
            'description' => $challenge->description,
            'target_enrollments' => $challenge->target_enrollments,
            'reward_amount' => $challenge->reward_amount,
            'starts_at' => $challenge->starts_at,
            'ends_at' => $challenge->ends_at,
            'current_enrollments' => $current,
            'status' => $challenge->status,
        ];
    }

    /**
     * @return array<int, array{id: int, name: string, validated_enrollments: int, rank: int}>
     */
    public function leaderboard(int $limit = 20): array
    {
        $rows = User::query()
            ->where('role', 'ambassador')
            ->leftJoinSub(
                Enrollment::query()
                    ->select('ambassador_id', DB::raw('COUNT(*) as validated_enrollments'))
                    ->whereNotNull('validated_at')
                    ->groupBy('ambassador_id'),
                'stats',
                'stats.ambassador_id',
                '=',
                'users.id'
            )
            ->select([
                'users.id',
                'users.name',
                DB::raw('COALESCE(stats.validated_enrollments, 0) as validated_enrollments'),
            ])
            ->orderByDesc('validated_enrollments')
            ->orderBy('users.name')
            ->limit($limit)
            ->get();

        $rank = 1;
        $previousCount = null;
        $position = 0;
        $leaderboard = [];

        foreach ($rows as $row) {
            $position++;
            $count = (int) $row->validated_enrollments;
            if ($previousCount !== null && $count < $previousCount) {
                $rank = $position;
            }
            $previousCount = $count;

            $leaderboard[] = [
                'id' => (int) $row->id,
                'name' => $this->firstName((string) $row->name),
                'validated_enrollments' => $count,
                'rank' => $rank,
            ];
        }

        return $leaderboard;
    }

    public function firstName(string $fullName): string
    {
        $parts = preg_split('/\s+/', trim($fullName)) ?: [];

        return $parts[0] ?? $fullName;
    }

    /**
     * @return array<int, array{
     *   id: int,
     *   date: string|null,
     *   label: string,
     *   amount: float,
     *   status: string,
     *   status_label: string
     * }>
     */
    public function earningsHistory(int $ambassadorId, int $limit = 30): array
    {
        $enrollments = Enrollment::query()
            ->with('lead')
            ->where('ambassador_id', $ambassadorId)
            ->whereNotNull('validated_at')
            ->orderByDesc('validated_at')
            ->limit($limit)
            ->get();

        return $enrollments->map(function (Enrollment $enrollment) use ($ambassadorId): array {
            $slug = $enrollment->lead?->formation_slug;
            $title = FormationPricing::query()->where('slug', $slug)->value('title')
                ?? $this->programLabel((string) $enrollment->program_type);

            $countAtValidation = Enrollment::query()
                ->where('ambassador_id', $ambassadorId)
                ->whereNotNull('validated_at')
                ->where('validated_at', '<=', $enrollment->validated_at)
                ->count();

            $status = $this->enrollmentEarningStatus($enrollment, $ambassadorId);

            return [
                'id' => (int) $enrollment->id,
                'date' => $enrollment->validated_at?->toDateString(),
                'label' => (string) $title,
                'amount' => $this->estimateEnrollmentCommission((string) $enrollment->program_type, $countAtValidation),
                'status' => $status,
                'status_label' => $this->earningStatusLabel($status),
            ];
        })->values()->all();
    }

    protected function programLabel(string $programType): string
    {
        return match ($programType) {
            'centre' => 'Formation Centre EIG',
            'college' => 'Formation Collège EIG',
            default => 'Formation EIG Supérieur',
        };
    }

    protected function estimateEnrollmentCommission(string $programType, int $validatedCount): float
    {
        $rule = CommissionRule::query()
            ->where('program_type', $programType)
            ->where('min_enrollments', '<=', max(1, $validatedCount))
            ->where(function ($query) use ($validatedCount): void {
                $query->whereNull('max_enrollments')
                    ->orWhere('max_enrollments', '>=', $validatedCount);
            })
            ->orderByDesc('min_enrollments')
            ->first();

        return (float) ($rule?->amount_per_enrollment ?? 0);
    }

    protected function enrollmentEarningStatus(Enrollment $enrollment, int $ambassadorId): string
    {
        if (! $enrollment->validated_at) {
            return 'pending';
        }

        $periodMonth = $enrollment->validated_at->format('Y-m');
        $commission = Commission::query()
            ->where('ambassador_id', $ambassadorId)
            ->where('period_month', $periodMonth)
            ->first();

        if (! $commission) {
            return 'validated';
        }

        $payout = Payout::query()
            ->where('commission_id', $commission->id)
            ->latest()
            ->first();

        if ($payout?->status === 'paid') {
            return 'paid';
        }

        if (in_array($payout?->status, ['processing', 'pending'], true)) {
            return 'pending';
        }

        if ($commission->status === 'approved' && ! $payout) {
            return 'validated';
        }

        if (in_array($commission->status, ['generated', 'in_payment'], true)) {
            return 'pending';
        }

        if ($commission->status === 'paid') {
            return 'paid';
        }

        return 'pending';
    }

    protected function earningStatusLabel(string $status): string
    {
        return match ($status) {
            'paid' => 'Payé',
            'validated' => 'Validé',
            default => 'En attente',
        };
    }
}
