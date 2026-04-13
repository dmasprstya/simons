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
            'division'   => $this->division,
            'role'       => $this->role,
            'is_active'     => $this->is_active,
            'profile_photo' => $this->profile_photo,
            'created_at'    => $this->created_at?->format('Y-m-d H:i'),
        ];
    }
}
