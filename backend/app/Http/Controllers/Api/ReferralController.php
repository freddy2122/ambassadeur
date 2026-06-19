<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\FrontendUrl;
use App\Models\ReferralClick;
use App\Models\ReferralLink;
use App\Notifications\PlatformNotification;
use App\Services\ProspectEnrollmentService;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    public function __construct(
        protected ProspectEnrollmentService $prospectEnrollment,
    ) {}

    private function publicStorageUrl(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        return asset('storage/'.$path);
    }

    public function track(Request $request, string $code)
    {
        $referralLink = ReferralLink::where('code', $code)
            ->where('is_active', true)
            ->firstOrFail();

        ReferralClick::create([
            'referral_link_id' => $referralLink->id,
            'source' => $request->query('source'),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Clic traqué avec succès.',
            'destination_url' => $referralLink->destination_url,
        ]);
    }

    public function storeProspect(Request $request)
    {
        $validated = $this->prospectEnrollment->validatedArray($request);
        $lead = $this->prospectEnrollment->createLead($validated);
        $lead->load('referralLink.ambassador');
        $ambassador = $lead->referralLink?->ambassador;
        if ($ambassador) {
            $ambassador->notify(new PlatformNotification(
                'Nouveau lead reçu',
                "Un nouveau prospect ({$lead->full_name}) vient de s'inscrire via votre lien.",
                FrontendUrl::path('dashboard/leads')
            ));
        }

        return response()->json([
            'message' => 'Prospect enregistré. Vous pouvez procéder au paiement des frais d’inscription.',
            'lead' => array_merge($lead->toArray(), [
                'birth_certificate_url' => $this->publicStorageUrl($lead->birth_certificate_path),
                'identity_document_url' => $this->publicStorageUrl($lead->identity_document_path),
                'diploma_document_url' => $this->publicStorageUrl($lead->diploma_document_path),
            ]),
        ], 201);
    }
}
