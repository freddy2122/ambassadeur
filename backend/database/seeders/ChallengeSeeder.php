<?php

namespace Database\Seeders;

use App\Models\Challenge;
use Illuminate\Database\Seeder;

class ChallengeSeeder extends Seeder
{
    public function run(): void
    {
        Challenge::query()->updateOrCreate(
            ['title' => 'Challenge Flash Week-end'],
            [
                'description' => '5 inscriptions validées avant la fin du week-end.',
                'target_enrollments' => 5,
                'reward_amount' => 50_000,
                'starts_at' => now()->startOfWeek(),
                'ends_at' => now()->endOfWeek(),
                'status' => 'active',
            ],
        );
    }
}
