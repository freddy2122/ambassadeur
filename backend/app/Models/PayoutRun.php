<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'command',
    'period_month',
    'status',
    'success_count',
    'failed_count',
    'skipped_count',
    'unchanged_count',
    'error_message',
    'started_at',
    'finished_at',
])]
class PayoutRun extends Model
{
    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }
}
