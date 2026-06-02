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
            $programType = $this->getMajorProgramType($enrollments);
            $rule = $this->resolveRule($programType, $totalEnrollments);

            if (! $rule) {
                continue;
            }

            $grossAmount = $totalEnrollments * (float) $rule->amount_per_enrollment;

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
