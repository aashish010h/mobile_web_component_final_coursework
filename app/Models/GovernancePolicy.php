<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GovernancePolicy extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'status',
        'effective_date',
        'approved_by'
    ];

    protected $casts = [
        'effective_date' => 'date',
    ];

    // Relationship: A policy has many supporting assets
    public function assets()
    {
        return $this->hasMany(KnowledgeAsset::class);
    }

    // Relationship: The approver
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Helper to check if policy is currently enforced
    public function isEnforced()
    {
        return $this->status === 'ACTIVE' && $this->effective_date <= now();
    }
}
