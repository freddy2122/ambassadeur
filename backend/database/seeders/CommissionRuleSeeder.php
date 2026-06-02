<?php

namespace Database\Seeders;

use App\Models\CommissionRule;
use Illuminate\Database\Seeder;

class CommissionRuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rules = [
            ['program_type' => 'superieur', 'tier' => 'bronze', 'min_enrollments' => 0, 'max_enrollments' => 10, 'amount_per_enrollment' => 10000],
            ['program_type' => 'superieur', 'tier' => 'argent', 'min_enrollments' => 11, 'max_enrollments' => 20, 'amount_per_enrollment' => 15500],
            ['program_type' => 'superieur', 'tier' => 'or', 'min_enrollments' => 21, 'max_enrollments' => null, 'amount_per_enrollment' => 20000],
            ['program_type' => 'centre', 'tier' => 'bronze', 'min_enrollments' => 0, 'max_enrollments' => 10, 'amount_per_enrollment' => 5500],
            ['program_type' => 'centre', 'tier' => 'argent', 'min_enrollments' => 11, 'max_enrollments' => 20, 'amount_per_enrollment' => 10500],
            ['program_type' => 'centre', 'tier' => 'or', 'min_enrollments' => 21, 'max_enrollments' => null, 'amount_per_enrollment' => 15000],
            ['program_type' => 'college', 'tier' => 'bronze', 'min_enrollments' => 0, 'max_enrollments' => 10, 'amount_per_enrollment' => 3500],
            ['program_type' => 'college', 'tier' => 'argent', 'min_enrollments' => 11, 'max_enrollments' => 20, 'amount_per_enrollment' => 5500],
            ['program_type' => 'college', 'tier' => 'or', 'min_enrollments' => 21, 'max_enrollments' => null, 'amount_per_enrollment' => 10000],
        ];

        foreach ($rules as $rule) {
            CommissionRule::updateOrCreate([
                'program_type' => $rule['program_type'],
                'tier' => $rule['tier'],
                'min_enrollments' => $rule['min_enrollments'],
            ], $rule);
        }
    }
}
