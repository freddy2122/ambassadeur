<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $adminPassword = (string) env('ADMIN_SEED_PASSWORD', 'Admin@12345');

        User::updateOrCreate([
            'email' => 'admin@eig.local',
        ], [
            'name' => 'Admin EIG',
            'password' => Hash::make($adminPassword),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $this->call(CommissionRuleSeeder::class);
    }
}
