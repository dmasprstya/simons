<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transformasi model User menjadi array representasi API.
     * Field password dan remember_token tidak diekspos.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'nip'        => $this->nip,
            'email'      => $this->email,
            'work_unit'  => $this->work_unit,
            'role'       => $this->role,
            'is_active'     => $this->is_active,
            'photo_url'     => $this->photo_url,
            'profile_photo' => $this->photo_url, // Alias for compatibility
            'created_at'    => $this->created_at?->format('Y-m-d H:i'),
        ];
    }
}
