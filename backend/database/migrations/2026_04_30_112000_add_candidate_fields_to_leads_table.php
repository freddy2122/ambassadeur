<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->string('last_diploma')->nullable()->after('program_type');
            $table->string('address')->nullable()->after('last_diploma');
            $table->string('guardian_name')->nullable()->after('address');
            $table->string('identity_number')->nullable()->after('guardian_name');
            $table->string('birth_certificate_path')->nullable()->after('identity_number');
            $table->string('identity_document_path')->nullable()->after('birth_certificate_path');
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn([
                'last_diploma',
                'address',
                'guardian_name',
                'identity_number',
                'birth_certificate_path',
                'identity_document_path',
            ]);
        });
    }
};
