<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'referral_link_id',
    'full_name',
    'email',
    'phone',
    'program_type',
    'formation_slug',
    'payment_reference',
    'last_diploma',
    'address',
    'guardian_name',
    'identity_number',
    'birth_certificate_path',
    'identity_document_path',
    'diploma_document_path',
    'status',
    'paid_at',
])]
class Lead extends Model
{
    protected function casts(): array
    {
        return [
            'paid_at' => 'datetime',
        ];
    }

    public function referralLink(): BelongsTo
    {
        return $this->belongsTo(ReferralLink::class);
    }
}
