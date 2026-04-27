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
            'action'     => trans("audit.action.{$this->action}") === "audit.action.{$this->action}" 
                ? $this->action 
                : trans("audit.action.{$this->action}"),
            'table_name' => trans("audit.table.{$this->table_name}") === "audit.table.{$this->table_name}" 
                ? $this->table_name 
                : trans("audit.table.{$this->table_name}"),
            'record_id'  => $this->record_id,
            'old_data'   => $this->translateData($this->old_data),
            'new_data'   => $this->translateData($this->newData ?? $this->new_data),
            'ip_address' => $this->ip_address,
            'created_at' => $this->created_at?->format('Y-m-d H:i'),


            // Relasi user — nullable jika aksi berasal dari sistem/scheduler
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }

    /**
     * Menerjemahkan key field di dalam data (old/new) jika tersedia di file bahasa.
     */
    private function translateData(?array $data): ?array
    {
        if (!$data) return null;

        $translated = [];
        foreach ($data as $key => $value) {
            $translatedKey = trans("audit.field.{$key}");
            $finalKey = ($translatedKey === "audit.field.{$key}") ? $key : $translatedKey;
            
            // Terjemahkan nilai jika ini adalah field status
            $finalValue = $value;
            if ($key === 'status' && is_string($value)) {
                $translatedValue = trans("audit.status.{$value}");
                $finalValue = ($translatedValue === "audit.status.{$value}") ? $value : $translatedValue;
            }

            $translated[$finalKey] = $finalValue;
        }


        return $translated;
    }
}

