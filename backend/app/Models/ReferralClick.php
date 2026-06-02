<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['referral_link_id', 'source', 'ip_address', 'user_agent', 'clicked_at'])]
class ReferralClick extends Model
{
    public function referralLink(): BelongsTo
    {
        return $this->belongsTo(ReferralLink::class);
    }
}
