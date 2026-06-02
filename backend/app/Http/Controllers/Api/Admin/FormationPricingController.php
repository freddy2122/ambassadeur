<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\FormationPricing;
use Illuminate\Http\Request;

class FormationPricingController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => FormationPricing::query()->orderBy('title')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'slug' => ['required', 'string', 'max:190', 'unique:formation_pricings,slug'],
            'title' => ['required', 'string', 'max:255'],
            'base_price' => ['nullable', 'numeric', 'min:0'],
            'discount_price' => ['nullable', 'numeric', 'min:0'],
            'registration_fee' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $pricing = FormationPricing::create($validated);

        return response()->json([
            'message' => 'Tarif formation cree.',
            'data' => $pricing,
        ], 201);
    }

    public function update(Request $request, FormationPricing $formationPricing)
    {
        $validated = $request->validate([
            'slug' => ['sometimes', 'string', 'max:190', 'unique:formation_pricings,slug,'.$formationPricing->id],
            'title' => ['sometimes', 'string', 'max:255'],
            'base_price' => ['nullable', 'numeric', 'min:0'],
            'discount_price' => ['nullable', 'numeric', 'min:0'],
            'registration_fee' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $formationPricing->update($validated);

        return response()->json([
            'message' => 'Tarif formation mis a jour.',
            'data' => $formationPricing->fresh(),
        ]);
    }

    public function destroy(FormationPricing $formationPricing)
    {
        $formationPricing->delete();

        return response()->json([
            'message' => 'Tarif formation supprime.',
        ]);
    }
}
