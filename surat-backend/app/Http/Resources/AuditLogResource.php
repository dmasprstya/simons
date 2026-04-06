<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    /**
     * Transformasi model AuditLog menjadi array representasi API.
     *
     * old_data dan new_data sudah di-cast sebagai array di model,
     * sehingga akan otomatis menjadi JSON object di response.
     *
     * Relasi user hanya dirender jika sudah di-load — bisa null
     * untuk aksi sistem (job scheduler) yang tidak memiliki user.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'action'     => $this->action,
            'table_name' => $this->table_name,
            'record_id'  => $this->record_id,
            // old_data & new_data sudah di-cast array di model → tampil sebagai JSON object
            'old_data'   => $this->old_data,
            'new_data'   => $this->new_data,
            'ip_address' => $this->ip_address,
            'created_at' => $this->created_at?->format('Y-m-d H:i'),

            // Relasi user — nullable jika aksi berasal dari sistem/scheduler
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}
