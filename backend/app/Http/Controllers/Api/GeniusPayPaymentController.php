<?php

namespace App\Http\Controllers\Api;

use App\Actions\FulfillLeadEnrollment;
use App\Http\Controllers\Controller;
use App\Models\FormationPricing;
use App\Models\Lead;
use App\Services\GeniusPayService;
use App\Support\FrontendUrl;
use Illuminate\Http\Request;

class GeniusPayPaymentController extends Controller
{
    public function __construct(
        private readonly GeniusPayService $geniusPay,
        private readonly FulfillLeadEnrollment $fulfillLeadEnrollment,
    ) {}

    public function initialize(Request $request)
    {
        $validated = $request->validate([
            'lead_id' => ['required', 'integer', 'exists:leads,id'],
            'formation_slug' => ['required', 'string', 'max:255'],
            'frontend_origin' => ['nullable', 'string', 'max:255'],
        ]);

        $lead = Lead::query()->findOrFail($validated['lead_id']);

        if ($lead->paid_at) {
            return response()->json([
                'message' => 'Ce dossier est deja marque comme paye.',
            ], 422);
        }

        $pricing = FormationPricing::query()
            ->where('slug', $validated['formation_slug'])
            ->where('is_active', true)
            ->first();

        if (! $pricing || $pricing->registration_fee === null) {
            return response()->json([
                'message' => 'Tarif ou frais d\'inscription introuvable pour cette formation.',
            ], 422);
        }

        $amount = (int) max(200, round((float) $pricing->registration_fee));
        $description = 'Frais de dossier — '.$pricing->title;
        $frontendOrigin = FrontendUrl::resolveOrigin($validated['frontend_origin'] ?? null);
        $callbackBase = url('/api/v1/payments/geniuspay/callback')
            .'?lead_id='.$lead->id
            .'&frontend_origin='.rawurlencode($frontendOrigin);

        try {
            $session = $this->geniusPay->createPaymentCheckout(
                $description,
                $amount,
                $callbackBase.'&status=success',
                $callbackBase.'&status=error',
                (string) $lead->full_name,
                (string) $lead->email,
                $lead->phone,
                [
                    'lead_id' => $lead->id,
                    'formation_slug' => $validated['formation_slug'],
                    'frontend_origin' => $frontendOrigin,
                ],
            );
        } catch (\Throwable $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 503);
        }

        $lead->update([
            'formation_slug' => $validated['formation_slug'],
            'payment_reference' => $session['reference'],
        ]);

        return response()->json([
            'checkout_url' => $session['checkout_url'],
            'authorization_url' => $session['checkout_url'],
            'reference' => $session['reference'],
        ]);
    }

    public function callback(Request $request)
    {
        $leadId = (int) $request->query('lead_id', 0);
        $status = strtolower((string) $request->query('status', ''));
        $frontendBase = FrontendUrl::resolveOrigin(
            is_string($request->query('frontend_origin')) ? $request->query('frontend_origin') : null,
        );

        if ($leadId < 1) {
            return redirect()->away($frontendBase.'/inscription/paiement-echec?raison=reference_manquante');
        }

        $lead = Lead::query()->find($leadId);
        if (! $lead) {
            return redirect()->away($frontendBase.'/inscription/paiement-echec?raison=lead_introuvable');
        }

        if ($status === 'error') {
            return redirect()->away($frontendBase.'/inscription/paiement-echec?raison=verification');
        }

        if ($lead->paid_at) {
            return redirect()->away($frontendBase.'/inscription/paiement-reussi?lead_id='.$lead->id);
        }

        $reference = (string) ($lead->payment_reference ?? '');
        if ($reference === '') {
            return redirect()->away($frontendBase.'/inscription/paiement-echec?raison=verification');
        }

        $payment = $this->geniusPay->retrievePayment($reference);
        if ($payment === null || ! $this->geniusPay->isPaymentCompleted($payment)) {
            return redirect()->away($frontendBase.'/inscription/paiement-echec?raison=verification');
        }

        $frontendBase = FrontendUrl::resolveOrigin(
            data_get($payment, 'metadata.frontend_origin')
                ?? (is_string($request->query('frontend_origin')) ? $request->query('frontend_origin') : null),
        );

        $metaLead = (int) (data_get($payment, 'metadata.lead_id') ?? 0);
        if ($metaLead !== $lead->id) {
            return redirect()->away($frontendBase.'/inscription/paiement-echec?raison=verification');
        }

        $this->fulfillLeadEnrollment->execute($lead);

        return redirect()->away($frontendBase.'/inscription/paiement-reussi?lead_id='.$lead->id);
    }

    public function webhook(Request $request)
    {
        if (! $this->geniusPay->verifyWebhookSignature($request)) {
            return response()->json(['message' => 'Signature invalide.'], 401);
        }

        $event = (string) ($request->header('X-Webhook-Event') ?? data_get($request->json()->all(), 'event', ''));
        if (! in_array($event, ['payment.success', 'payment.completed'], true)) {
            return response()->json(['received' => true]);
        }

        $paymentData = data_get($request->json()->all(), 'data', []);
        if (! is_array($paymentData)) {
            return response()->json(['received' => true]);
        }

        $reference = (string) ($paymentData['reference'] ?? '');
        if ($reference === '') {
            return response()->json(['received' => true]);
        }

        $payment = $this->geniusPay->retrievePayment($reference);
        if ($payment === null || ! $this->geniusPay->isPaymentCompleted($payment)) {
            return response()->json(['received' => true]);
        }

        $leadId = (int) (data_get($payment, 'metadata.lead_id') ?? 0);
        if ($leadId < 1) {
            return response()->json(['received' => true]);
        }

        $lead = Lead::query()->find($leadId);
        if (! $lead || $lead->paid_at) {
            return response()->json(['received' => true]);
        }

        if ((string) $lead->payment_reference !== $reference) {
            return response()->json(['received' => true]);
        }

        $this->fulfillLeadEnrollment->execute($lead);

        return response()->json(['received' => true]);
    }
}
