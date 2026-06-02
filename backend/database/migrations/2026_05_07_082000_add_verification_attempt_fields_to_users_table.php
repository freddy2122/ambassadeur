<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->unsignedTinyInteger('verification_attempts')->default(0)->after('verification_code_expires_at');
            $table->timestamp('verification_locked_until')->nullable()->after('verification_attempts');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['verification_attempts', 'verification_locked_until']);
        });
    }
};
