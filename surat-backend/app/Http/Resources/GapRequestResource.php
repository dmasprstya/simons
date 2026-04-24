<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GapRequestResource extends JsonResource
{
    /**
     * Transformasi model GapRequest menjadi array representasi API.
     *
     * number nullable — hanya terisi jika status = 'approved' dan
     * releaseGapNumber() sudah dijalankan oleh GapRequestService.
     *
     * Relasi classification, requestedBy, reviewedBy hanya dirender
     * jika sudah di-load — menggunakan whenLoaded() untuk mencegah N+1.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            // gap_date di-cast sebagai Carbon date → format Y-m-d
            'gap_date'    => $this->gap_date?->format('Y-m-d'),
            'subject'     => $this->subject,
            'destination' => $this->destination,
            'sifat_surat' => $this->sifat_surat,
            'reason'      => $this->reason,
            'rejection_reason' => $this->rejection_reason,
            'status'      => $this->status,
            // number nullable — diisi saat gap disetujui dan nomor dikeluarkan
            'number'      => $this->number,
            'formatted_number' => $this->number && $this->status === 'approved' && $this->relationLoaded('classification')
                ? \App\Models\LetterNumber::buildFormattedNumber($this->classification->code, $this->number)
                : null,
            // reviewed_at nullable — diisi saat admin mereview
            'reviewed_at' => $this->reviewed_at?->format('Y-m-d H:i'),
            'created_at'  => $this->created_at?->format('Y-m-d H:i'),

            // Relasi — hanya ikut jika eager loaded di controller
            'classification' => new LetterClassificationResource($this->whenLoaded('classification')),
            'requested_by'   => new UserResource($this->whenLoaded('requestedBy')),
            'reviewed_by'    => new UserResource($this->whenLoaded('reviewedBy')),
        ];
    }
}
