<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['ambassador_id', 'period_month', 'validated_enrollments', 'gross_amount', 'tier', 'status'])]
class Commission extends Model
{
    public function ambassador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ambassador_id');
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(Payout::class);
    }

    protected function casts(): array
    {
        return [
            'gross_amount' => 'float',
        ];
    }
}
