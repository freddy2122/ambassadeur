<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Services\CommissionService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CommissionProcessController extends Controller
{
    public function __construct(private readonly CommissionService $commissionService)
    {
    }

    public function index(Request $request)
    {
        $allowedSorts = ['id', 'period_month', 'validated_enrollments', 'gross_amount', 'tier', 'status', 'created_at'];
        $sortBy = $request->string('sort_by', 'created_at')->toString();
        $sortDir = strtolower($request->string('sort_dir', 'desc')->toString()) === 'asc' ? 'asc' : 'desc';
        $sortBy = in_array($sortBy, $allowedSorts, true) ? $sortBy : 'created_at';

        $query = Commission::query()->with('ambassador');

        if ($request->filled('period_month')) {
            $query->where('period_month', $request->string('period_month'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json([
            'data' => $query->orderBy($sortBy, $sortDir)->paginate((int) $request->integer('per_page', 10)),
        ]);
    }

    public function generate(Request $request)
    {
        $validated = $request->validate([
            'period_month' => ['required', 'date_format:Y-m'],
        ]);

        $commissions = $this->commissionService->generateForMonth($validated['period_month']);

        return response()->json([
            'message' => 'Commissions générées.',
            'count' => $commissions->count(),
            'data' => $commissions->values(),
        ]);
    }

    public function approve(Commission $commission)
    {
        $commission->update([
            'status' => 'approved',
        ]);

        return response()->json([
            'message' => 'Commission approuvée.',
            'data' => $commission->fresh(),
        ]);
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $query = Commission::query()->with('ambassador');

        if ($request->filled('period_month')) {
            $query->where('period_month', $request->string('period_month'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $filename = 'commissions_'.$request->string('period_month', now()->format('Y-m')).'.csv';

        return response()->streamDownload(function () use ($query): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'id',
                'ambassador_name',
                'ambassador_email',
                'period_month',
                'validated_enrollments',
                'tier',
                'gross_amount',
                'status',
                'created_at',
            ]);

            $query->orderByDesc('created_at')->chunk(200, function ($rows) use ($handle): void {
                foreach ($rows as $commission) {
                    fputcsv($handle, [
                        $commission->id,
                        $commission->ambassador?->name,
                        $commission->ambassador?->email,
                        $commission->period_month,
                        $commission->validated_enrollments,
                        $commission->tier,
                        $commission->gross_amount,
                        $commission->status,
                        $commission->created_at,
                    ]);
                }
            });

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
