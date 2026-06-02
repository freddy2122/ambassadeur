<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

#[Fillable([
    'name',
    'email',
    'password',
    'role',
    'verification_code',
    'verification_code_expires_at',
    'verification_attempts',
    'verification_locked_until',
    'referred_by_user_id',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'verification_code_expires_at' => 'datetime',
            'verification_locked_until' => 'datetime',
        ];
    }

    public function ambassadorProfile(): HasOne
    {
        return $this->hasOne(AmbassadorProfile::class);
    }

    public function referralLinks(): HasMany
    {
        return $this->hasMany(ReferralLink::class, 'ambassador_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class, 'ambassador_id');
    }
}
