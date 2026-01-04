<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CsvRecord extends Model
{
    protected $fillable = ['csv_file_id', 'payload'];

    protected $casts = [
        'payload' => 'json', // allows storing JSON as JSONB
    ];

    public function file(): BelongsTo
    {
        return $this->belongsTo(CsvFile::class, 'csv_file_id');
    }
}
