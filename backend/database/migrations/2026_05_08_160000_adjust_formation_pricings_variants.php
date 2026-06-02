<?php

/**
 * Tarifs distincts par parcours (alignés avec le fichier frontend formations.ts pour le fallback).
 * À rapprocher des grilles officielles sur https://eiggroupe.com — l’interface admin permet d’affiner hors migration.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $rows = [
            'communication-visuelle-graphique-numerique' => [742000, 49500],
            'developpement-web-mobile-logiciel' => [788000, 55000],
            'realisation-cinema-television' => [768000, 52000],
            'marketing-communication-digitale' => [732000, 48500],
            'journalisme-multimedia' => [718000, 47500],
            'design-graphique-certifiante' => [628000, 35000],
            'ui-ux-design-certifiante' => [618000, 33500],
            'developpement-web-mobile-certifiante' => [658000, 36000],
            'montage-video-certifiante' => [592000, 33000],
            'serigraphie-certifiante' => [565000, 31000],
            'photographie-cadrage-certifiante' => [598000, 33000],
            'graphisme-pao-continue' => [325000, 19500],
            'ui-ux-design-continue' => [392000, 21500],
            'montage-video-continue' => [338000, 20000],
            'campagnes-communication-continue' => [365000, 20500],
            'analyse-donnees-python-continue' => [418000, 22500],
            'wordpress-continue' => [275000, 18000],
        ];

        foreach ($rows as $slug => [$base, $fee]) {
            DB::table('formation_pricings')->where('slug', $slug)->update([
                'base_price' => $base,
                'discount_price' => null,
                'registration_fee' => $fee,
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        $licenceFee = [750000, 50000];
        $certFee = [600000, 33000];
        $contFee = [350000, 20000];

        foreach ([
            'communication-visuelle-graphique-numerique' => $licenceFee,
            'developpement-web-mobile-logiciel' => $licenceFee,
            'realisation-cinema-television' => $licenceFee,
            'marketing-communication-digitale' => $licenceFee,
            'journalisme-multimedia' => $licenceFee,
            'design-graphique-certifiante' => $certFee,
            'ui-ux-design-certifiante' => $certFee,
            'developpement-web-mobile-certifiante' => $certFee,
            'montage-video-certifiante' => $certFee,
            'serigraphie-certifiante' => $certFee,
            'photographie-cadrage-certifiante' => $certFee,
            'graphisme-pao-continue' => $contFee,
            'ui-ux-design-continue' => $contFee,
            'montage-video-continue' => $contFee,
            'campagnes-communication-continue' => $contFee,
            'analyse-donnees-python-continue' => $contFee,
            'wordpress-continue' => $contFee,
        ] as $slug => [$base, $fee]) {
            DB::table('formation_pricings')->where('slug', $slug)->update([
                'base_price' => $base,
                'registration_fee' => $fee,
                'updated_at' => now(),
            ]);
        }
    }
};
