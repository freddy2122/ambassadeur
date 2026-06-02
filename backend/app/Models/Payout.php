<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'ambassador_id',
    'commission_id',
    'amount',
    'method',
    'status',
    'retry_count',
    'next_retry_at',
    'last_error',
    'provider_reference',
    'provider_payload',
    'paid_at',
])]
class Payout extends Model
{
    public function ambassador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ambassador_id');
    }

    public function commission(): BelongsTo
    {
        return $this->belongsTo(Commission::class);
    }

    protected function casts(): array
    {
        return [
            'provider_payload' => 'array',
            'paid_at' => 'datetime',
            'next_retry_at' => 'datetime',
            'amount' => 'float',
        ];
    }
}
