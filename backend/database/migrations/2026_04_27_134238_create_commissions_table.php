<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ambassador_id')->constrained('users')->cascadeOnDelete();
            $table->string('period_month');
            $table->unsignedInteger('validated_enrollments')->default(0);
            $table->decimal('gross_amount', 12, 2)->default(0);
            $table->string('tier')->default('bronze');
            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commissions');
    }
};
