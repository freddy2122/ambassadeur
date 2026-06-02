<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\CommissionRule;
use App\Models\Enrollment;
use App\Models\FormationPricing;
use App\Models\Payout;
use App\Models\User;

class FormationCatalogController extends Controller
{
    public function platformStats()
    {
        $ambassadors = User::query()->where('role', 'ambassador')->count();
        $validatedEnrollments = Enrollment::query()->whereNotNull('validated_at')->count();
        $totalDistributed = (float) Payout::query()->where('status', 'paid')->sum('amount');

        if ($totalDistributed <= 0) {
            $totalDistributed = (float) Commission::query()
                ->whereIn('status', ['approved', 'paid', 'in_payment'])
                ->sum('gross_amount');
        }

        return response()->json([
            'data' => [
                'ambassadors' => $ambassadors,
                'validated_enrollments' => $validatedEnrollments,
                'total_distributed' => $totalDistributed,
            ],
        ]);
    }

    public function commissionRulesIndex()
    {
        return response()->json([
            'data' => CommissionRule::query()
                ->orderBy('program_type')
                ->orderBy('min_enrollments')
                ->get(),
        ]);
    }

    public function pricingIndex()
    {
        return response()->json([
            'data' => FormationPricing::query()
                ->where('is_active', true)
                ->orderBy('title')
                ->get(),
        ]);
    }

    public function pricingShow(string $slug)
    {
        $pricing = FormationPricing::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (! $pricing) {
            return response()->json([
                'message' => 'Tarif introuvable pour cette formation.',
            ], 404);
        }

        return response()->json([
            'data' => $pricing,
        ]);
    }
}
