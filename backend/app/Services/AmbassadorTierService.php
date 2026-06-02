<?php

namespace App\Services;

class AmbassadorTierService
{
    public const THRESHOLDS = [
        'bronze' => 0,
        'argent' => 6,
        'or' => 11,
        'platine' => 21,
    ];

    /** @var array<string, int|null> */
    public const TIER_CAPS = [
        'bronze' => 5,
        'argent' => 10,
        'or' => 20,
        'platine' => null,
    ];

    /** @var array<string, string|null> */
    public const NEXT_TIER = [
        'bronze' => 'argent',
        'argent' => 'or',
        'or' => 'platine',
        'platine' => null,
    ];

    public function resolveTier(int $validatedCount): string
    {
        if ($validatedCount >= self::THRESHOLDS['platine']) {
            return 'platine';
        }
        if ($validatedCount >= self::THRESHOLDS['or']) {
            return 'or';
        }
        if ($validatedCount >= self::THRESHOLDS['argent']) {
            return 'argent';
        }

        return 'bronze';
    }

    /**
     * @return array{
     *   current_tier: string,
     *   next_tier: string|null,
     *   progress_current: int,
     *   progress_target: int|null
     * }
     */
    public function tierProgress(int $validatedCount): array
    {
        $currentTier = $this->resolveTier($validatedCount);
        $nextTier = self::NEXT_TIER[$currentTier];
        $target = self::TIER_CAPS[$currentTier];

        return [
            'current_tier' => $currentTier,
            'next_tier' => $nextTier,
            'progress_current' => $validatedCount,
            'progress_target' => $target,
        ];
    }
}
