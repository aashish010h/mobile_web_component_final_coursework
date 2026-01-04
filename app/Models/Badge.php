<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Badge extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'icon',             // e.g., "🏆" or "storage/badges/gold.png"
        'points_required',  // The threshold to auto-award this badge
    ];

    /**
     * The users that have earned this badge.
     */
    public function users()
    {
        // specific pivot table 'user_badge' with the timestamp of when they got it
        return $this->belongsToMany(User::class, 'user_badge')
            ->withPivot('awarded_at')
            ->withTimestamps();
    }
}
