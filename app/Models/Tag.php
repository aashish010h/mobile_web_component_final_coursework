<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'category'];

    public function assets()
    {
        return $this->belongsToMany(KnowledgeAsset::class, 'knowledge_asset_tag');
    }
}
