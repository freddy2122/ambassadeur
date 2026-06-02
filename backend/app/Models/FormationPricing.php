<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'slug',
    'title',
    'base_price',
    'discount_price',
    'registration_fee',
    'is_active',
])]
class FormationPricing extends Model
{
    protected function casts(): array
    {
        return [
            'base_price' => 'float',
            'discount_price' => 'float',
            'registration_fee' => 'float',
            'is_active' => 'boolean',
        ];
    }
}
