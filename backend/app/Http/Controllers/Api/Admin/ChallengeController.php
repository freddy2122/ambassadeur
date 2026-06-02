<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Challenge;
use Illuminate\Http\Request;

class ChallengeController extends Controller
{
    public function index()
    {
        $challenges = Challenge::query()
            ->orderByDesc('starts_at')
            ->get();

        return response()->json(['data' => $challenges]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'target_enrollments' => ['required', 'integer', 'min:1'],
            'reward_amount' => ['required', 'integer', 'min:0'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'status' => ['nullable', 'string', 'in:active,draft,ended'],
        ]);

        $challenge = Challenge::query()->create([
            ...$validated,
            'status' => $validated['status'] ?? 'active',
        ]);

        return response()->json([
            'message' => 'Challenge publié.',
            'data' => $challenge,
        ], 201);
    }
}
