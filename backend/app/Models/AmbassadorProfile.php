<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'user_id',
    'phone',
    'status',
    'onboarding_step',
    'bio',
    'payment_method',
    'payment_account',
    'payment_account_holder',
    'payment_bank_code',
])]
class AmbassadorProfile extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
