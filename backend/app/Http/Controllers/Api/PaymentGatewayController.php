<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * Paiement inscription candidats : FedaPay uniquement.
 */
class PaymentGatewayController extends Controller
{
    public function config()
    {
        return response()->json([
            'driver' => 'fedapay',
        ]);
    }

    public function initialize(Request $request)
    {
        return app(FedaPayPaymentController::class)->initialize($request);
    }
}
