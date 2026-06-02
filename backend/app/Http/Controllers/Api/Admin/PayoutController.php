<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\Payout;
use App\Services\CommissionPayoutTriggerService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PayoutController extends Controller
{
    public function __construct(
        private readonly CommissionPayoutTriggerService $commissionPayoutTrigger,
    ) {
    }

    public function index(Request $request)
    {
        $allowedSorts = ['id', 'amount', 'status', 'method', 'created_at'];
        $sortBy = $request->string('sort_by', 'created_at')->toString();
        $sortDir = strtolower($request->string('sort_dir', 'desc')->toString()) === 'asc' ? 'asc' : 'desc';
        $sortBy = in_array($sortBy, $allowedSorts, true) ? $sortBy : 'created_at';

        $query = Payout::query()->with(['ambassador', 'commission']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json([
            'data' => $query->orderBy($sortBy, $sortDir)->paginate((int) $request->integer('per_page', 10)),
        ]);
    }

    public function trigger(Request $request)
    {
        $validated = $request->validate([
            'commission_ids' => ['required', 'array', 'min:1'],
            'commission_ids.*' => ['integer', 'exists:commissions,id'],
            'currency' => ['nullable', 'string', 'max:10'],
        ]);

        $commissions = Commission::query()
            ->whereIn('id', $validated['commission_ids'])
            ->where('status', 'approved')
            ->with('ambassador.ambassadorProfile')
            ->get();

        $results = $this->commissionPayoutTrigger->triggerBatch($commissions, $validated['currency'] ?? null);

        return response()->json([
            'message' => 'Déclenchement de paiement terminé.',
            'count' => count($results),
            'data' => $results,
        ]);
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $query = Payout::query()->with(['ambassador', 'commission']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $filename = 'payouts_'.now()->format('Y-m').'.csv';

        return response()->streamDownload(function () use ($query): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'id',
                'ambassador_name',
                'ambassador_email',
                'commission_id',
                'amount',
                'method',
                'status',
                'provider_reference',
                'created_at',
            ]);

            $query->orderByDesc('created_at')->chunk(200, function ($rows) use ($handle): void {
                foreach ($rows as $payout) {
                    fputcsv($handle, [
                        $payout->id,
                        $payout->ambassador?->name,
                        $payout->ambassador?->email,
                        $payout->commission_id,
                        $payout->amount,
                        $payout->method,
                        $payout->status,
                        $payout->provider_reference,
                        $payout->created_at,
                    ]);
                }
            });

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
