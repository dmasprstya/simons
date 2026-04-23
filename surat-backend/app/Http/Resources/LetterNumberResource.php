<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LetterNumberResource extends JsonResource
{
    /**
     * Transformasi model LetterNumber menjadi array representasi API.
     *
     * Relasi classification, user, dan voidedBy hanya dirender jika sudah di-load
     * (eager loaded) — menggunakan whenLoaded() untuk mencegah N+1 query.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'number'           => $this->number,
            'formatted_number' => $this->formatted_number,
            // issued_date di-cast sebagai Carbon date → format Y-m-d
            'issued_date'      => $this->issued_date?->format('Y-m-d'),
            'subject'          => $this->subject,
            'destination'      => $this->destination,
            'source'           => $this->source,
            'sifat_surat'      => $this->sifat_surat,
            'status'           => $this->status,
            // voided_at nullable — hanya ada jika surat telah di-void
            'voided_at'        => $this->voided_at?->format('Y-m-d H:i'),
            'created_at'       => $this->created_at?->format('Y-m-d H:i'),

            // Relasi — hanya ikut jika eager loaded di controller
            'classification' => new LetterClassificationResource($this->whenLoaded('classification')),
            'user'           => new UserResource($this->whenLoaded('user')),
            'voided_by_user' => new UserResource($this->whenLoaded('voidedBy')),
        ];
    }
}
