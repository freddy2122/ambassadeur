<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->string('formation_slug')->nullable()->after('program_type');
            $table->string('payment_reference')->nullable()->after('status');
            $table->timestamp('paid_at')->nullable()->after('payment_reference');
        });

        Schema::table('ambassador_profiles', function (Blueprint $table) {
            $table->string('payment_bank_code', 20)->nullable()->after('payment_account');
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn(['formation_slug', 'payment_reference', 'paid_at']);
        });

        Schema::table('ambassador_profiles', function (Blueprint $table) {
            $table->dropColumn('payment_bank_code');
        });
    }
};
