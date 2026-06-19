<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PaymentGatewayController extends Controller
{
    public function config()
    {
        $driver = config('services.payment.driver', 'fedapay');

        return response()->json([
            'driver' => $driver,
            'label' => match ($driver) {
                'geniuspay' => 'Genius Pay',
                default => 'FedaPay',
            },
        ]);
    }

    public function initialize(Request $request)
    {
        $driver = config('services.payment.driver', 'fedapay');

        return match ($driver) {
            'geniuspay' => app(GeniusPayPaymentController::class)->initialize($request),
            default => app(FedaPayPaymentController::class)->initialize($request),
        };
    }
}
