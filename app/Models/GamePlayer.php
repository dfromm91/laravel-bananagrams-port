<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class GamePlayer extends Pivot
{
    protected $table = 'game_user';

    public $incrementing = true;

    protected function casts(): array
    {
        return [
            'state' => 'array',
            'left_at' => 'datetime',
        ];
    }
}
