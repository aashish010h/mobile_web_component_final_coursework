<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KnowledgeAssetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'summary' => $this->summary,
            'status' => $this->status,
            'view_count' => $this->view_count,
            'is_encrypted' => (bool) $this->is_encrypted,

            // Relationships
            'author' => new UserResource($this->whenLoaded('author')),
            'tags' => $this->tags->pluck('name'), // Just send tag names for display
            'policy' => $this->whenLoaded('policy', function () {
                return [
                    'id' => $this->policy->id,
                    'title' => $this->policy->title,
                    'status' => $this->policy->status,
                ];
            }),
            // File Handling (Only generate URL if file exists)
            'download_url' => $this->file_path ? url('/api/assets/' . $this->id . '/download') : null,

            // Dates (UK Format)
            'created_at' => $this->created_at->format('d/m/Y'),
            'updated_at' => $this->updated_at->format('d/m/Y'),
        ];
    }
}
