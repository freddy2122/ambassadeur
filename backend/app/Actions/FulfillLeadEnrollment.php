<?php

namespace App\Actions;

use App\Models\Enrollment;
use App\Models\FormationPricing;
use App\Models\Lead;
use App\Support\FormationProgramType;
use Illuminate\Support\Facades\DB;

final class FulfillLeadEnrollment
{
    /**
     * Idempotent : verrouillage du lead pour eviter double inscription (webhook + callback).
     */
    public function execute(Lead $lead): void
    {
        DB::transaction(function () use ($lead): void {
            $locked = Lead::query()->whereKey($lead->id)->lockForUpdate()->first();

            if (! $locked || $locked->paid_at) {
                return;
            }

            $locked->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);

            $slug = $locked->formation_slug;
            $programType = FormationProgramType::fromSlug($slug);

            $referralLink = $locked->referralLink()->with('ambassador')->first();
            $ambassadorId = $referralLink?->ambassador_id;

            if (! $ambassadorId) {
                return;
            }

            if (Enrollment::query()->where('lead_id', $locked->id)->exists()) {
                return;
            }

            $tuition = 0;
            if ($slug) {
                $pricing = FormationPricing::query()->where('slug', $slug)->first();
                $tuition = $pricing
                    ? (float) ($pricing->discount_price ?? $pricing->base_price ?? 0)
                    : 0;
            }

            Enrollment::create([
                'ambassador_id' => $ambassadorId,
                'lead_id' => $locked->id,
                'program_type' => $programType,
                'tuition_amount' => $tuition,
                'validated_at' => now(),
            ]);
        });
    }
}
