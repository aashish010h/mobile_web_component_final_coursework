<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class KnowledgeAsset extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'author_id',
        'title',
        'slug',
        'summary',
        'content_body',
        'file_path',
        'status',
        'is_encrypted',
        'locale_code',
        'rejection_reason',
        'published_at'
    ];

    protected $casts = [
        'is_encrypted' => 'boolean',
        'published_at' => 'datetime',
        'view_count' => 'integer',
    ];

    // RELATIONSHIPS

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'knowledge_asset_tag');
    }

    // Scopes for easy filtering in your Dashboard
    public function scopePublished($query)
    {
        return $query->where('status', 'PUBLISHED');
    }
}
