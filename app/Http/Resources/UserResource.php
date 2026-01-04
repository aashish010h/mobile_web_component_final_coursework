<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,

            // Critical fields you were missing:
            'role' => $this->role,
            'department' => $this->department,

            // Cast to boolean so React gets true/false, not 1/0
            'is_active' => (bool) $this->is_active,

            // 1. Raw ISO string for your 'timeAgo' helper and JS Date objects
            'created_at' => $this->created_at,

            // 2. Pre-formatted string for direct display (UK Format)
            'joined_display' => $this->created_at->format('d/m/Y H:i'),
        ];
    }
}
