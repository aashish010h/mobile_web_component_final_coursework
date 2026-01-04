<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CsvFileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'original_name' => $this->original_name,
            'stored_path' => $this->stored_path,
            'size_bytes' => $this->size_bytes,
            'mime_type' => $this->mime_type,
            'total_chunks' => $this->total_chunks,
            'status' => $this->status,
            'batch_id' => $this->batch_id,
            'records_count' => $this->whenCounted('records'),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
