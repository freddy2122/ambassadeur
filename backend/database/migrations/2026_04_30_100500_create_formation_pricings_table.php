<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('formation_pricings', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->decimal('base_price', 12, 2)->nullable();
            $table->decimal('discount_price', 12, 2)->nullable();
            $table->decimal('registration_fee', 12, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        DB::table('formation_pricings')->insert([
            ['slug' => 'communication-visuelle-graphique-numerique', 'title' => 'Communication visuelle (Graphique et Numerique)', 'base_price' => 750000, 'discount_price' => null, 'registration_fee' => 50000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['slug' => 'developpement-web-mobile-logiciel', 'title' => 'Developpement web, mobile et logiciel', 'base_price' => 750000, 'discount_price' => null, 'registration_fee' => 50000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['slug' => 'realisation-cinema-television', 'title' => 'Realisation Cinema et Television', 'base_price' => 750000, 'discount_price' => null, 'registration_fee' => 50000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['slug' => 'marketing-communication-digitale', 'title' => 'Marketing et Communication digitale', 'base_price' => 750000, 'discount_price' => null, 'registration_fee' => 50000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['slug' => 'journalisme-multimedia', 'title' => 'Journalisme Multimedia', 'base_price' => 750000, 'discount_price' => null, 'registration_fee' => 50000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['slug' => 'design-graphique-certifiante', 'title' => 'Design Graphique', 'base_price' => 600000, 'discount_price' => null, 'registration_fee' => 33000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['slug' => 'ui-ux-design-certifiante', 'title' => 'UI/UX Design', 'base_price' => 600000, 'discount_price' => null, 'registration_fee' => 33000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['slug' => 'developpement-web-mobile-certifiante', 'title' => 'Developpement Web et mobile', 'base_price' => 600000, 'discount_price' => null, 'registration_fee' => 33000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['slug' => 'montage-video-certifiante', 'title' => 'Montage Video', 'base_price' => 600000, 'discount_price' => null, 'registration_fee' => 33000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['slug' => 'serigraphie-certifiante', 'title' => 'Serigraphie', 'base_price' => 600000, 'discount_price' => null, 'registration_fee' => 33000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['slug' => 'photographie-cadrage-certifiante', 'title' => 'Photographie et Cadrage', 'base_price' => 600000, 'discount_price' => null, 'registration_fee' => 33000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['slug' => 'graphisme-pao-continue', 'title' => 'Graphisme PAO', 'base_price' => 350000, 'discount_price' => null, 'registration_fee' => 20000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['slug' => 'ui-ux-design-continue', 'title' => 'UI/UX Design', 'base_price' => 350000, 'discount_price' => null, 'registration_fee' => 20000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['slug' => 'montage-video-continue', 'title' => 'Montage Video', 'base_price' => 350000, 'discount_price' => null, 'registration_fee' => 20000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['slug' => 'campagnes-communication-continue', 'title' => 'Conception et deploiement des campagnes de communication', 'base_price' => 350000, 'discount_price' => null, 'registration_fee' => 20000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['slug' => 'analyse-donnees-python-continue', 'title' => 'Analyse de donnees avec Python', 'base_price' => 350000, 'discount_price' => null, 'registration_fee' => 20000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['slug' => 'wordpress-continue', 'title' => 'WordPress', 'base_price' => 350000, 'discount_price' => null, 'registration_fee' => 20000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('formation_pricings');
    }
};
