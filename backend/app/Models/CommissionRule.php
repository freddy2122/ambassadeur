<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['program_type', 'tier', 'min_enrollments', 'max_enrollments', 'amount_per_enrollment'])]
class CommissionRule extends Model
{
}
