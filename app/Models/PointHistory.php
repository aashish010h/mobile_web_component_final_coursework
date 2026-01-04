<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PointHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action_type',    // e.g. 'UPLOAD_ASSET', 'LOGIN_STREAK', 'REVIEW_COMPLETED'
        'points_awarded', // e.g. 10, 50, -5
    ];

    /**
     * Get the user who earned these points.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
