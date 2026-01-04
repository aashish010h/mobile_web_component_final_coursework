<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CsvFile extends Model
{
    protected $fillable = [
        'original_name',
        'stored_path',
        'size_bytes',
        'mime_type',
        'total_chunks',
        'status',
        'batch_id',
    ];

    protected $casts = [
        'size_bytes' => 'integer',
        'total_chunks' => 'integer',
    ];

    public function records(): HasMany
    {
        return $this->hasMany(CsvRecord::class, 'csv_file_id');
    }
}
