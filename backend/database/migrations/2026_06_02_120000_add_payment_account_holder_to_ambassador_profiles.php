<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ambassador_profiles', function (Blueprint $table): void {
            $table->string('payment_account_holder')->nullable()->after('payment_account');
        });
    }

    public function down(): void
    {
        Schema::table('ambassador_profiles', function (Blueprint $table): void {
            $table->dropColumn('payment_account_holder');
        });
    }
};
