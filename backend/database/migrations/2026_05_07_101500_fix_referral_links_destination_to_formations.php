<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $frontendBaseUrl = rtrim((string) config('app.frontend_url', config('app.url')), '/');

        DB::table('referral_links')
            ->whereNull('destination_url')
            ->orWhere('destination_url', 'like', '%/inscription?ref=%')
            ->orWhere('destination_url', 'like', '%/inscription?code=%')
            ->orderBy('id')
            ->chunkById(200, function ($links) use ($frontendBaseUrl): void {
                foreach ($links as $link) {
                    DB::table('referral_links')
                        ->where('id', $link->id)
                        ->update([
                            'destination_url' => "{$frontendBaseUrl}/formations?ref={$link->code}",
                        ]);
                }
            });
    }

    public function down(): void
    {
        // Intentionally left blank (data migration).
    }
};
