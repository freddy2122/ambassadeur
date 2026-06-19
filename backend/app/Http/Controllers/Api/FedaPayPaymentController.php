<?php

namespace App\Http\Controllers\Api;

use App\Support\FrontendUrl;
use App\Actions\FulfillLeadEnrollment;
use App\Http\Controllers\Controller;
use App\Models\FormationPricing;
use App\Models\Lead;
use App\Services\FedaPayService;
use Illuminate\Http\Request;

/**
 * Paiement des frais d'inscription via FedaPay (page de paiement hebergee).
 *
 * @see https://docs.fedapay.com/integration-api/fr/collects-management-fr.md
 */
class FedaPayPaymentController extends Controller
{
    public function __construct(
        private readonly FedaPayService $fedapay,
        private readonly FulfillLeadEnrollment $fulfillLeadEnrollment,
    ) {}

    public function initialize(Request $request)
    {
        $validated = $request->validate([
            'lead_id' => ['required', 'integer', 'exists:leads,id'],
            'formation_slug' => ['required', 'string', 'max:255'],
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

        $amount = (int) max(100, round((float) $pricing->registration_fee));
        $description = 'Frais de dossier — '.$pricing->title;
        [$firstname, $lastname] = $this->splitFullName((string) $lead->full_name);
        $phonePayload = FedaPayService::formatCustomerPhone($lead->phone);

        $callbackUrl = url('/api/v1/payments/fedapay/callback').'?lead_id='.$lead->id;

        try {
            $session = $this->fedapay->createTransactionCheckout(
                $description,
                $amount,
                $callbackUrl,
                $firstname,
                $lastname,
                (string) $lead->email,
                $phonePayload,
                [
                    'lead_id' => $lead->id,
                    'formation_slug' => $validated['formation_slug'],
                ],
            );
        } catch (\Throwable $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 503);
        }

        $lead->update([
            'formation_slug' => $validated['formation_slug'],
            'payment_reference' => $session['transaction_id'],
        ]);

        return response()->json([
            'checkout_url' => $session['checkout_url'],
            'authorization_url' => $session['checkout_url'],
            'reference' => $session['reference'],
        ]);
    }

    /**
     * Retour navigateur apres paiement (callback_url FedaPay).
     */
    public function callback(Request $request)
    {
        $frontendBase = FrontendUrl::base();
        $leadId = (int) $request->query('lead_id', 0);
        $txIdRaw = $request->query('id')
            ?? $request->query('transaction_id')
            ?? $request->query('transaction');

        if ($leadId < 1) {
            return redirect()->away($frontendBase.'/inscription/paiement-echec?raison=reference_manquante');
        }

        $lead = Lead::query()->find($leadId);
        if (! $lead) {
            return redirect()->away($frontendBase.'/inscription/paiement-echec?raison=lead_introuvable');
        }

        $tx = null;
        if (is_string($txIdRaw) && $txIdRaw !== '' && ctype_digit($txIdRaw)) {
            $tx = $this->fedapay->retrieveTransaction((int) $txIdRaw);
        }
        if ($tx === null && $lead->payment_reference !== null && $lead->payment_reference !== '' && ctype_digit((string) $lead->payment_reference)) {
            $tx = $this->fedapay->retrieveTransaction((int) $lead->payment_reference);
        }

        if ($tx === null) {
            return redirect()->away($frontendBase.'/inscription/paiement-echec?raison=verification');
        }

        $metaLead = (int) (data_get($tx, 'custom_metadata.lead_id') ?? data_get($tx, 'metadata.lead_id') ?? 0);
        if ($metaLead !== $lead->id) {
            return redirect()->away($frontendBase.'/inscription/paiement-echec?raison=verification');
        }

        if (! $this->isApproved($tx)) {
            return redirect()->away($frontendBase.'/inscription/paiement-echec?raison=verification');
        }

        if ($lead->paid_at) {
            return redirect()->away($frontendBase.'/inscription/paiement-reussi?lead_id='.$lead->id);
        }

        $this->fulfillLeadEnrollment->execute($lead);

        return redirect()->away($frontendBase.'/inscription/paiement-reussi?lead_id='.$lead->id);
    }

    /**
     * Webhook FedaPay (transaction approuvee, etc.).
     */
    public function webhook(Request $request)
    {
        $payload = $request->json()->all();
        $name = data_get($payload, 'name') ?? data_get($payload, 'event');

        if (! is_string($name) || stripos($name, 'transaction') === false || stripos($name, 'approved') === false) {
            return response()->json(['received' => true]);
        }

        $txId = (int) (data_get($payload, 'entity.id')
            ?? data_get($payload, 'object.id')
            ?? data_get($payload, 'data.entity.id')
            ?? data_get($payload, 'data.id')
            ?? 0);

        if ($txId < 1) {
            return response()->json(['received' => true]);
        }

        $tx = $this->fedapay->retrieveTransaction($txId);
        if ($tx === null || ! $this->isApproved($tx)) {
            return response()->json(['received' => true]);
        }

        $leadId = (int) (data_get($tx, 'custom_metadata.lead_id') ?? data_get($tx, 'metadata.lead_id') ?? 0);
        if ($leadId < 1) {
            return response()->json(['received' => true]);
        }

        $lead = Lead::query()->find($leadId);
        if (! $lead || $lead->paid_at) {
            return response()->json(['received' => true]);
        }

        if ((string) $lead->payment_reference !== (string) $txId) {
            return response()->json(['received' => true]);
        }

        $this->fulfillLeadEnrollment->execute($lead);

        return response()->json(['received' => true]);
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function splitFullName(string $fullName): array
    {
        $fullName = trim(preg_replace('/\s+/u', ' ', $fullName) ?? '');
        if ($fullName === '') {
            return ['Client', 'Client'];
        }
        $parts = preg_split('/\s+/u', $fullName, 2) ?: [];

        return [
            $parts[0] ?? 'Client',
            $parts[1] ?? $parts[0] ?? 'Client',
        ];
    }

    /**
     * @param  array<string, mixed>  $tx
     */
    private function isApproved(array $tx): bool
    {
        return strtolower((string) ($tx['status'] ?? '')) === 'approved';
    }
}
