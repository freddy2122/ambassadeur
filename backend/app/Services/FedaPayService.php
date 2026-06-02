<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class FedaPayService
{
    private function apiKey(): string
    {
        $k = config('services.fedapay.api_key');

        return is_string($k) ? trim(preg_replace('/\s+/', '', $k) ?? '') : '';
    }

    private function baseUrl(): string
    {
        return rtrim((string) config('services.fedapay.base_url', 'https://api.fedapay.com/v1'), '/');
    }

    /**
     * @param  array<string, mixed>|null  $json
     * @return array<string, mixed>
     */
    public static function unwrapPayload(?array $json): array
    {
        if ($json === null) {
            return [];
        }
        if (isset($json['v1']) && is_array($json['v1'])) {
            return $json['v1'];
        }
        // Réponses création transaction : objet sous "v1/transaction" (id, payment_url, reference…).
        if (isset($json['v1/transaction']) && is_array($json['v1/transaction'])) {
            return $json['v1/transaction'];
        }
        if (isset($json['data']) && is_array($json['data'])) {
            $inner = $json['data'];
            if (isset($inner['v1']) && is_array($inner['v1'])) {
                return $inner['v1'];
            }
            if (isset($inner['v1/transaction']) && is_array($inner['v1/transaction'])) {
                return $inner['v1/transaction'];
            }

            return $inner;
        }

        return $json;
    }

    public function assertInscriptionConfigured(): void
    {
        if ($this->apiKey() === '') {
            throw new \RuntimeException('FEDAPAY_API_KEY manquant pour les paiements inscription.');
        }
    }

    /**
     * @return array{number: string, country: string}
     */
    public static function formatCustomerPhone(?string $digits): array
    {
        $d = preg_replace('/\D+/', '', (string) $digits) ?? '';
        if ($d === '') {
            return ['number' => '+22900000000', 'country' => 'bj'];
        }
        if (strlen($d) === 10 && str_starts_with($d, '01')) {
            return ['number' => '+229'.$d, 'country' => 'bj'];
        }
        if (str_starts_with($d, '229') && strlen($d) >= 12) {
            return ['number' => '+'.$d, 'country' => 'bj'];
        }

        return ['number' => str_starts_with($d, '+') ? $d : '+'.$d, 'country' => 'bj'];
    }

    /**
     * POST /transactions puis POST /transactions/{id}/token.
     *
     * @param  array<string, mixed>  $customMetadata
     * @return array{checkout_url: string, transaction_id: string, reference: string}
     */
    public function createTransactionCheckout(
        string $description,
        int $amountXof,
        string $callbackUrl,
        string $firstname,
        string $lastname,
        string $email,
        array $phoneNumber,
        array $customMetadata,
    ): array {
        $this->assertInscriptionConfigured();

        $payload = [
            'description' => mb_substr($description, 0, 500),
            'amount' => max(100, $amountXof),
            'currency' => ['iso' => 'XOF'],
            'callback_url' => $callbackUrl,
            'customer' => [
                'firstname' => mb_substr($firstname !== '' ? $firstname : 'Client', 0, 120),
                'lastname' => mb_substr($lastname !== '' ? $lastname : 'Client', 0, 120),
                'email' => $email,
                'phone_number' => $phoneNumber,
            ],
            'custom_metadata' => $customMetadata,
        ];

        $mode = config('services.fedapay.checkout_mode');
        if (is_string($mode) && $mode !== '') {
            $payload['mode'] = $mode;
        }

        $create = Http::timeout(45)
            ->withToken($this->apiKey())
            ->acceptJson()
            ->post($this->baseUrl().'/transactions', $payload);

        if (! $create->successful()) {
            throw new \RuntimeException('FedaPay transaction: '.$create->body());
        }

        $created = self::unwrapPayload($create->json());

        /** @var int|string|null $id */
        $id = $created['id'] ?? null;
        if (! is_numeric($id)) {
            throw new \RuntimeException('FedaPay transaction: identifiant absent. '.json_encode($created));
        }

        $immediateUrl = $created['payment_url'] ?? null;
        if (is_string($immediateUrl) && $immediateUrl !== '') {
            return [
                'checkout_url' => $immediateUrl,
                'transaction_id' => (string) $id,
                'reference' => is_string($created['reference'] ?? null) && ($created['reference'] ?? '') !== ''
                    ? (string) $created['reference']
                    : (string) $id,
            ];
        }

        $tokenRes = Http::timeout(45)
            ->withToken($this->apiKey())
            ->acceptJson()
            ->post($this->baseUrl().'/transactions/'.$id.'/token');

        if (! $tokenRes->successful()) {
            throw new \RuntimeException('FedaPay lien de paiement: '.$tokenRes->body());
        }

        $tokenBody = self::unwrapPayload($tokenRes->json());
        $url = $tokenBody['url']
            ?? $tokenBody['payment_url']
            ?? null;
        if (! is_string($url) || $url === '') {
            throw new \RuntimeException('FedaPay lien de paiement: URL absente. '.json_encode($tokenBody));
        }

        $token = $tokenBody['token']
            ?? $tokenBody['payment_token']
            ?? null;

        return [
            'checkout_url' => $url,
            'transaction_id' => (string) $id,
            'reference' => is_string($token) && $token !== '' ? $token : ((string) ($tokenBody['reference'] ?? $id)),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    public function retrieveTransaction(int|string $id): ?array
    {
        if ($this->apiKey() === '') {
            return null;
        }

        $r = Http::timeout(30)
            ->withToken($this->apiKey())
            ->acceptJson()
            ->get($this->baseUrl().'/transactions/'.$id);

        if (! $r->successful()) {
            return null;
        }

        $u = self::unwrapPayload($r->json());

        return $u !== [] ? $u : null;
    }

    public function createTransfer(array $payload): array
    {
        $apiKey = $this->apiKey();
        $baseUrl = $this->baseUrl();

        if ($apiKey === '') {
            return [
                'provider_reference' => 'sim_'.Str::upper(Str::random(12)),
                'status' => 'simulated',
                'raw' => ['message' => 'FedaPay API key manquante, mode simulation actif.'],
            ];
        }

        $response = Http::withToken($apiKey)
            ->acceptJson()
            ->post($baseUrl.'/transfers', $payload);

        if (! $response->successful()) {
            return [
                'provider_reference' => null,
                'status' => 'failed',
                'raw' => $response->json(),
            ];
        }

        $data = $response->json();

        return [
            'provider_reference' => data_get($data, 'v1.id') ?? data_get($data, 'id'),
            'status' => data_get($data, 'v1.status') ?? data_get($data, 'status', 'processing'),
            'raw' => $data,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    public function retrieveTransfer(int|string $id): ?array
    {
        if ($this->apiKey() === '') {
            return null;
        }

        $r = Http::timeout(30)
            ->withToken($this->apiKey())
            ->acceptJson()
            ->get($this->baseUrl().'/transfers/'.$id);

        if (! $r->successful()) {
            return null;
        }

        $u = self::unwrapPayload($r->json());

        return $u !== [] ? $u : null;
    }
}
