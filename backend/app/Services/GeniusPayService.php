<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class GeniusPayService
{
    private function apiKey(): string
    {
        $k = config('services.geniuspay.api_key');

        return is_string($k) ? trim($k) : '';
    }

    private function apiSecret(): string
    {
        $k = config('services.geniuspay.api_secret');

        return is_string($k) ? trim($k) : '';
    }

    private function baseUrl(): string
    {
        return rtrim((string) config('services.geniuspay.base_url', 'https://pay.genius.ci/api/v1/merchant'), '/');
    }

    private function payoutWalletId(): string
    {
        $id = config('services.geniuspay.payout_wallet_id');

        return is_string($id) ? trim($id) : '';
    }

    /**
     * Headers communs API marchand (paiements, wallets, payouts).
     *
     * @return array<string, string>
     */
    private function merchantHeaders(): array
    {
        return [
            'X-API-Key' => $this->apiKey(),
            'X-API-Secret' => $this->apiSecret(),
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ];
    }

    /**
     * @deprecated Utiliser merchantHeaders() — conservé pour compatibilité interne.
     *
     * @return array<string, string>
     */
    private function paymentHeaders(): array
    {
        return $this->merchantHeaders();
    }

    /**
     * @return array<string, string>
     */
    private function payoutHeaders(): array
    {
        return $this->merchantHeaders();
    }

    /**
     * @param  array<string, mixed>|null  $json
     * @return array<string, mixed>
     */
    public static function unwrapData(?array $json): array
    {
        if ($json === null) {
            return [];
        }
        if (isset($json['data']) && is_array($json['data'])) {
            return $json['data'];
        }

        return $json;
    }

    public function assertInscriptionConfigured(): void
    {
        if ($this->apiKey() === '' || $this->apiSecret() === '') {
            throw new \RuntimeException('GENIUSPAY_API_KEY et GENIUSPAY_API_SECRET requis pour les paiements inscription.');
        }
    }

    public static function formatPhone(?string $digits): string
    {
        $d = preg_replace('/\D+/', '', (string) $digits) ?? '';
        if ($d === '') {
            return '+22900000000';
        }
        if (strlen($d) === 10 && str_starts_with($d, '01')) {
            return '+229'.$d;
        }
        if (str_starts_with($d, '229') && strlen($d) >= 12) {
            return '+'.$d;
        }

        return str_starts_with($d, '+') ? $d : '+'.$d;
    }

    public static function mapPaymentMethodToProvider(?string $method): string
    {
        return match (strtolower((string) $method)) {
            'moov' => 'moov_money',
            'celtiis' => 'moov_money',
            default => 'mtn_momo',
        };
    }

    /**
     * @param  array<string, mixed>  $metadata
     * @return array{checkout_url: string, reference: string}
     */
    public function createPaymentCheckout(
        string $description,
        int $amountXof,
        string $successUrl,
        string $errorUrl,
        string $customerName,
        string $email,
        ?string $phone,
        array $metadata,
    ): array {
        $this->assertInscriptionConfigured();

        $response = Http::timeout(45)
            ->withHeaders($this->paymentHeaders())
            ->post($this->baseUrl().'/payments', [
                'amount' => max(200, $amountXof),
                'currency' => 'XOF',
                'description' => mb_substr($description, 0, 500),
                'customer' => [
                    'name' => mb_substr($customerName !== '' ? $customerName : 'Client', 0, 200),
                    'email' => $email,
                    'phone' => self::formatPhone($phone),
                    'country' => 'BJ',
                ],
                'success_url' => $successUrl,
                'error_url' => $errorUrl,
                'metadata' => $metadata,
            ]);

        if (! $response->successful()) {
            throw new \RuntimeException('GeniusPay paiement: '.$response->body());
        }

        $data = self::unwrapData($response->json());
        $checkoutUrl = $data['checkout_url'] ?? $data['payment_url'] ?? null;
        $reference = $data['reference'] ?? null;

        if (! is_string($checkoutUrl) || $checkoutUrl === '') {
            throw new \RuntimeException('GeniusPay paiement: URL checkout absente. '.json_encode($data));
        }
        if (! is_string($reference) || $reference === '') {
            throw new \RuntimeException('GeniusPay paiement: reference absente. '.json_encode($data));
        }

        return [
            'checkout_url' => $checkoutUrl,
            'reference' => $reference,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    public function retrievePayment(string $reference): ?array
    {
        if ($this->apiKey() === '' || $this->apiSecret() === '') {
            return null;
        }

        $response = Http::timeout(30)
            ->withHeaders($this->paymentHeaders())
            ->get($this->baseUrl().'/payments/'.$reference);

        if (! $response->successful()) {
            return null;
        }

        $data = self::unwrapData($response->json());

        return $data !== [] ? $data : null;
    }

    public function isPaymentCompleted(array $payment): bool
    {
        $status = strtolower((string) ($payment['status'] ?? ''));

        return in_array($status, ['completed', 'paid', 'successful', 'success'], true);
    }

    /**
     * @return array<string, mixed>|null
     */
    public function retrievePaymentWithRetry(string $reference, int $attempts = 5, int $sleepMs = 1500): ?array
    {
        $attempts = max(1, $attempts);

        for ($i = 0; $i < $attempts; $i++) {
            $payment = $this->retrievePayment($reference);
            if ($payment === null) {
                return null;
            }

            if ($this->isPaymentCompleted($payment)) {
                return $payment;
            }

            $status = strtolower((string) ($payment['status'] ?? ''));
            $retryable = in_array($status, ['pending', 'processing'], true);
            if (! $retryable || $i === $attempts - 1) {
                return $payment;
            }

            usleep(max(200, $sleepMs) * 1000);
        }

        return null;
    }

    public function verifyWebhookSignature(Request $request): bool
    {
        $secret = config('services.geniuspay.webhook_secret');
        if (! is_string($secret) || trim($secret) === '') {
            return (bool) config('app.debug');
        }

        $signature = (string) $request->header('X-Webhook-Signature', '');
        $timestamp = (string) $request->header('X-Webhook-Timestamp', '');
        if ($signature === '' || $timestamp === '') {
            return false;
        }

        $payload = $request->all();
        $data = $timestamp.'.'.json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $expected = hash_hmac('sha256', $data, trim($secret));

        if (! hash_equals($expected, $signature)) {
            return false;
        }

        return abs(time() - (int) $timestamp) <= 300;
    }

    /**
     * @return array{provider_reference: string|null, status: string, raw: array<string, mixed>|null}
     */
    public function createTransfer(array $payload): array
    {
        $secret = $this->apiSecret();
        $walletId = $this->payoutWalletId();

        if ($this->apiKey() === '' || $secret === '' || $walletId === '') {
            return [
                'provider_reference' => 'sim_'.Str::upper(Str::random(12)),
                'status' => 'simulated',
                'raw' => ['message' => 'GeniusPay secret ou GENIUSPAY_PAYOUT_WALLET_ID manquant, mode simulation actif.'],
            ];
        }

        $phone = self::formatPhone($payload['customer']['phone'] ?? null);
        $name = (string) ($payload['customer']['name'] ?? 'Ambassadeur');
        $email = $payload['customer']['email'] ?? null;
        $provider = self::mapPaymentMethodToProvider($payload['payment_method'] ?? null);
        $idempotencyKey = $payload['idempotency_key'] ?? Str::uuid()->toString();

        $body = [
            'wallet_id' => $walletId,
            'recipient' => array_filter([
                'name' => $name,
                'phone' => $phone,
                'email' => is_string($email) && $email !== '' ? $email : null,
            ]),
            'destination' => [
                'type' => 'mobile_money',
                'provider' => $provider,
                'account' => $phone,
            ],
            'amount' => max(1, (int) round((float) ($payload['amount'] ?? 0))),
            'currency' => (string) ($payload['currency'] ?? 'XOF'),
            'description' => (string) ($payload['description'] ?? 'Commission ambassadeur'),
            'metadata' => is_array($payload['metadata'] ?? null) ? $payload['metadata'] : [],
            'idempotency_key' => (string) $idempotencyKey,
        ];

        $response = Http::timeout(45)
            ->withHeaders($this->payoutHeaders())
            ->post($this->baseUrl().'/payouts', $body);

        if (! $response->successful()) {
            return [
                'provider_reference' => null,
                'status' => 'failed',
                'raw' => is_array($response->json()) ? $response->json() : ['body' => $response->body()],
            ];
        }

        $json = $response->json();
        $payout = is_array($json['data']['payout'] ?? null) ? $json['data']['payout'] : self::unwrapData($json);

        return [
            'provider_reference' => $payout['reference'] ?? $payout['id'] ?? null,
            'status' => $this->normalizePayoutStatus((string) ($payout['status'] ?? 'processing')),
            'raw' => is_array($json) ? $json : null,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    public function retrieveTransfer(int|string $reference): ?array
    {
        if ($this->apiSecret() === '') {
            return null;
        }

        $response = Http::timeout(30)
            ->withHeaders($this->payoutHeaders())
            ->get($this->baseUrl().'/payouts/'.$reference);

        if (! $response->successful()) {
            return null;
        }

        $json = $response->json();
        $payout = is_array($json['data']['payout'] ?? null) ? $json['data']['payout'] : self::unwrapData($json);

        return $payout !== [] ? $payout : null;
    }

    /**
     * @return array{wallets: list<array<string, mixed>>, error: string|null}
     */
    public function listWalletsResult(): array
    {
        if ($this->apiKey() === '' || $this->apiSecret() === '') {
            return ['wallets' => [], 'error' => 'GENIUSPAY_API_KEY ou GENIUSPAY_API_SECRET manquant.'];
        }

        $response = Http::timeout(30)
            ->withHeaders($this->merchantHeaders())
            ->get($this->baseUrl().'/wallets');

        if (! $response->successful()) {
            $message = data_get($response->json(), 'error.message') ?? $response->body();

            return ['wallets' => [], 'error' => 'HTTP '.$response->status().' — '.$message];
        }

        $data = self::unwrapData($response->json());
        $wallets = $data['wallets'] ?? $data;

        return [
            'wallets' => is_array($wallets) ? $wallets : [],
            'error' => null,
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function listWallets(): array
    {
        return $this->listWalletsResult()['wallets'];
    }

    private function normalizePayoutStatus(string $status): string
    {
        $status = strtolower($status);

        return match ($status) {
            'failed', 'cancelled', 'canceled', 'rejected' => 'failed',
            'completed', 'successful', 'success', 'paid' => 'paid',
            'simulated' => 'simulated',
            default => 'processing',
        };
    }
}
