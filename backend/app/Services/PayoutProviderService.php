<?php

namespace App\Services;

class PayoutProviderService
{
    public function __construct(
        private readonly FedaPayService $fedaPayService,
        private readonly GeniusPayService $geniusPayService,
    ) {}

    public function driver(): string
    {
        $driver = config('services.payment.driver', 'fedapay');

        return is_string($driver) && $driver !== '' ? strtolower($driver) : 'fedapay';
    }

    public function method(): string
    {
        return $this->driver();
    }

    /**
     * @return array{provider_reference: string|int|null, status: string, raw: array<string, mixed>|null}
     */
    public function createTransfer(array $payload): array
    {
        return match ($this->driver()) {
            'geniuspay' => $this->geniusPayService->createTransfer($payload),
            default => $this->fedaPayService->createTransfer($payload),
        };
    }

    /**
     * @return array<string, mixed>|null
     */
    public function retrieveTransfer(int|string $reference): ?array
    {
        return match ($this->driver()) {
            'geniuspay' => $this->geniusPayService->retrieveTransfer($reference),
            default => ctype_digit((string) $reference)
                ? $this->fedaPayService->retrieveTransfer((int) $reference)
                : null,
        };
    }

    public function isTransferSuccessful(array $transfer): bool
    {
        $rawStatus = strtolower((string) ($transfer['status'] ?? ''));

        return match ($this->driver()) {
            'geniuspay' => in_array($rawStatus, ['completed', 'successful', 'success', 'paid'], true),
            default => in_array($rawStatus, ['approved', 'transferred', 'successful', 'success', 'completed'], true),
        };
    }

    public function isTransferFailed(array $transfer): bool
    {
        $rawStatus = strtolower((string) ($transfer['status'] ?? ''));

        return in_array($rawStatus, ['failed', 'canceled', 'cancelled', 'rejected'], true);
    }

    public function providerLabel(): string
    {
        return match ($this->driver()) {
            'geniuspay' => 'Genius Pay',
            default => 'FedaPay',
        };
    }
}
