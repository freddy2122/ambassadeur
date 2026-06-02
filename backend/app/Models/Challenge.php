<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'title',
    'description',
    'target_enrollments',
    'reward_amount',
    'starts_at',
    'ends_at',
    'status',
])]
class Challenge extends Model
{
    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'target_enrollments' => 'integer',
            'reward_amount' => 'integer',
        ];
    }

    public function scopeActive($query)
    {
        return $query
            ->where('status', 'active')
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>=', now());
    }
}
