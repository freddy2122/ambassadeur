<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['ambassador_id', 'lead_id', 'program_type', 'tuition_amount', 'validated_at'])]
class Enrollment extends Model
{
    protected function casts(): array
    {
        return [
            'validated_at' => 'datetime',
            'tuition_amount' => 'decimal:2',
        ];
    }

    public function ambassador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ambassador_id');
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }
}
