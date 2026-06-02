<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payout;
use App\Models\PayoutRun;
use Illuminate\Http\Request;

class PayoutRunController extends Controller
{
    public function index(Request $request)
    {
        $query = PayoutRun::query()->latest('started_at');

        if ($request->filled('command')) {
            $query->where('command', $request->string('command'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $runs = $query->paginate((int) $request->integer('per_page', 15));
        $allRuns = PayoutRun::query();

        $totalSuccess = (int) $allRuns->sum('success_count');
        $totalFailed = (int) $allRuns->sum('failed_count');
        $totalRuns = (int) $allRuns->count();
        $successRate = ($totalSuccess + $totalFailed) > 0
            ? round(($totalSuccess / ($totalSuccess + $totalFailed)) * 100, 2)
            : 0;

        $pendingRetries = Payout::query()
            ->where('status', 'failed')
            ->whereNotNull('next_retry_at')
            ->where('next_retry_at', '>', now())
            ->count();

        return response()->json([
            'summary' => [
                'success_rate' => $successRate,
                'total_success' => $totalSuccess,
                'total_failed' => $totalFailed,
                'total_runs' => $totalRuns,
                'pending_retries' => $pendingRetries,
            ],
            'data' => $runs,
        ]);
    }
}
