<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LetterClassificationResource extends JsonResource
{
    /**
     * Transformasi model LetterClassification menjadi array representasi API.
     * parent_id diekspos agar frontend bisa merekonstruksi hierarki.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'code'       => $this->code,
            'name'       => $this->name,
            'type'       => $this->type,
            'level'      => $this->level,
            'is_leaf'    => $this->is_leaf,
            'is_active'  => $this->is_active,
            'parent_id'  => $this->parent_id,
            'created_at' => $this->created_at?->format('Y-m-d H:i'),
        ];
    }
}
