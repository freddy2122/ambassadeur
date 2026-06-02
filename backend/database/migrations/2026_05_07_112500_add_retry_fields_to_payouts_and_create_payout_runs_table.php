<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payouts', function (Blueprint $table): void {
            $table->unsignedTinyInteger('retry_count')->default(0)->after('status');
            $table->timestamp('next_retry_at')->nullable()->after('retry_count');
            $table->text('last_error')->nullable()->after('next_retry_at');
        });

        Schema::create('payout_runs', function (Blueprint $table): void {
            $table->id();
            $table->string('command', 80);
            $table->string('period_month', 7)->nullable();
            $table->string('status', 40)->default('running');
            $table->unsignedInteger('success_count')->default(0);
            $table->unsignedInteger('failed_count')->default(0);
            $table->unsignedInteger('skipped_count')->default(0);
            $table->unsignedInteger('unchanged_count')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payout_runs');

        Schema::table('payouts', function (Blueprint $table): void {
            $table->dropColumn(['retry_count', 'next_retry_at', 'last_error']);
        });
    }
};
