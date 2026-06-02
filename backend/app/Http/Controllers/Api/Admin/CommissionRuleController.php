<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommissionRule;
use Illuminate\Http\Request;

class CommissionRuleController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => CommissionRule::query()
                ->orderBy('program_type')
                ->orderBy('min_enrollments')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'program_type' => ['required', 'string', 'max:100'],
            'tier' => ['required', 'string', 'in:bronze,argent,or'],
            'min_enrollments' => ['required', 'integer', 'min:0'],
            'max_enrollments' => ['nullable', 'integer', 'min:0'],
            'amount_per_enrollment' => ['required', 'numeric', 'min:0'],
        ]);

        $rule = CommissionRule::create($validated);

        return response()->json([
            'message' => 'Règle de commission créée.',
            'data' => $rule,
        ], 201);
    }

    public function show(CommissionRule $commissionRule)
    {
        return response()->json(['data' => $commissionRule]);
    }

    public function update(Request $request, CommissionRule $commissionRule)
    {
        $validated = $request->validate([
            'program_type' => ['sometimes', 'string', 'max:100'],
            'tier' => ['sometimes', 'string', 'in:bronze,argent,or'],
            'min_enrollments' => ['sometimes', 'integer', 'min:0'],
            'max_enrollments' => ['nullable', 'integer', 'min:0'],
            'amount_per_enrollment' => ['sometimes', 'numeric', 'min:0'],
        ]);

        $commissionRule->update($validated);

        return response()->json([
            'message' => 'Règle de commission mise à jour.',
            'data' => $commissionRule->fresh(),
        ]);
    }

    public function destroy(CommissionRule $commissionRule)
    {
        $commissionRule->delete();

        return response()->json([
            'message' => 'Règle de commission supprimée.',
        ]);
    }
}
