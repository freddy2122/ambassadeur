<?php

namespace App\Services;

use App\Models\Commission;
use App\Models\CommissionRule;
use App\Models\Enrollment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class CommissionService
{
    public function generateForMonth(string $periodMonth): Collection
    {
        $start = Carbon::createFromFormat('Y-m', $periodMonth)->startOfMonth();
        $end = (clone $start)->endOfMonth();

        $ambassadors = User::query()
            ->where('role', 'ambassador')
            ->with(['enrollments' => function ($query) use ($start, $end): void {
                $query->whereNotNull('validated_at')
                    ->whereBetween('validated_at', [$start, $end]);
            }])
            ->get();

        $createdCommissions = collect();

        foreach ($ambassadors as $ambassador) {
            $enrollments = $ambassador->enrollments;

            if ($enrollments->isEmpty()) {
                continue;
            }

            $totalEnrollments = $enrollments->count();
            $grossAmount = $this->calculateGrossForEnrollments($ambassador->id, $enrollments);
            $programType = $this->getMajorProgramType($enrollments);
            $rule = $this->resolveRule($programType, $totalEnrollments);

            if (! $rule || $grossAmount <= 0) {
                continue;
            }

            $commission = Commission::query()->firstOrNew([
                'ambassador_id' => $ambassador->id,
                'period_month' => $periodMonth,
            ]);

            $commission->validated_enrollments = $totalEnrollments;
            $commission->gross_amount = $grossAmount;
            $commission->tier = $rule->tier;
            $commission->status = $commission->exists ? $commission->status : 'generated';
            $commission->save();

            $createdCommissions->push($commission);
        }

        return $createdCommissions;
    }

    public function accrueForEnrollment(Enrollment $enrollment): ?Commission
    {
        if (! $enrollment->validated_at || ! $enrollment->ambassador_id) {
            return null;
        }

        $validatedAt = Carbon::parse($enrollment->validated_at);
        $amount = $this->amountForEnrollment($enrollment->ambassador_id, (string) $enrollment->program_type, $validatedAt);

        if ($amount <= 0) {
            return null;
        }

        $periodMonth = $validatedAt->format('Y-m');

        $commission = Commission::query()->firstOrNew([
            'ambassador_id' => $enrollment->ambassador_id,
            'period_month' => $periodMonth,
        ]);

        $commission->gross_amount = (float) ($commission->gross_amount ?? 0) + $amount;
        $commission->validated_enrollments = (int) ($commission->validated_enrollments ?? 0) + 1;

        $countAtValidation = $this->validatedCountAt($enrollment->ambassador_id, $validatedAt);
        $rule = $this->resolveRule((string) $enrollment->program_type, $countAtValidation);
        $commission->tier = $rule?->tier ?? $commission->tier ?? 'bronze';

        if (! $commission->exists || in_array($commission->status, ['generated', 'pending'], true)) {
            $commission->status = 'approved';
        }

        $commission->save();

        return $commission;
    }

    private function calculateGrossForEnrollments(int $ambassadorId, Collection $enrollments): float
    {
        $grossAmount = 0.0;

        foreach ($enrollments->sortBy('validated_at') as $enrollment) {
            $validatedAt = Carbon::parse($enrollment->validated_at);
            $grossAmount += $this->amountForEnrollment(
                $ambassadorId,
                (string) $enrollment->program_type,
                $validatedAt,
            );
        }

        return $grossAmount;
    }

    private function amountForEnrollment(int $ambassadorId, string $programType, Carbon $validatedAt): float
    {
        $countAtValidation = $this->validatedCountAt($ambassadorId, $validatedAt);
        $rule = $this->resolveRule($programType, $countAtValidation);

        return (float) ($rule?->amount_per_enrollment ?? 0);
    }

    private function validatedCountAt(int $ambassadorId, Carbon $validatedAt): int
    {
        return Enrollment::query()
            ->where('ambassador_id', $ambassadorId)
            ->whereNotNull('validated_at')
            ->where('validated_at', '<=', $validatedAt)
            ->count();
    }

    private function getMajorProgramType(Collection $enrollments): string
    {
        return $enrollments
            ->groupBy('program_type')
            ->sortByDesc(fn (Collection $group): int => $group->count())
            ->keys()
            ->first() ?? 'superieur';
    }

    private function resolveRule(string $programType, int $totalEnrollments): ?CommissionRule
    {
        return CommissionRule::query()
            ->where('program_type', $programType)
            ->where('min_enrollments', '<=', $totalEnrollments)
            ->where(function ($query) use ($totalEnrollments): void {
                $query->whereNull('max_enrollments')
                    ->orWhere('max_enrollments', '>=', $totalEnrollments);
            })
            ->orderByDesc('min_enrollments')
            ->first();
    }
}
