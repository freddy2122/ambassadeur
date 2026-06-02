<?php

namespace App\Support;

/**
 * Aligne le slug de formation frontend avec les cles {@see CommissionRule} (superieur, centre, college).
 */
final class FormationProgramType
{
    /** @var list<string> */
    private const SUPERIEUR_SLUGS = [
        'communication-visuelle-graphique-numerique',
        'developpement-web-mobile-logiciel',
        'realisation-cinema-television',
        'marketing-communication-digitale',
        'journalisme-multimedia',
    ];

    /** @var list<string> */
    private const CENTRE_SLUGS = [
        'design-graphique-certifiante',
        'ui-ux-design-certifiante',
        'developpement-web-mobile-certifiante',
        'montage-video-certifiante',
        'serigraphie-certifiante',
        'photographie-cadrage-certifiante',
    ];

    /** @var list<string> */
    private const COLLEGE_SLUGS = [
        'graphisme-pao-continue',
        'ui-ux-design-continue',
        'montage-video-continue',
        'campagnes-communication-continue',
        'analyse-donnees-python-continue',
        'wordpress-continue',
    ];

    public static function fromSlug(?string $slug): string
    {
        if (! $slug) {
            return 'superieur';
        }

        if (in_array($slug, self::CENTRE_SLUGS, true)) {
            return 'centre';
        }

        if (in_array($slug, self::COLLEGE_SLUGS, true)) {
            return 'college';
        }

        return 'superieur';
    }
}
