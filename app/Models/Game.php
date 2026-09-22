<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['mode', 'status', 'max_players', 'state'])]
class Game extends Model
{
    protected function casts(): array
    {
        return [
            'max_players' => 'integer',
            'state' => 'array',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
            'stats_recorded_at' => 'datetime',
        ];
    }

    public function players(): BelongsToMany
    {
        return $this
            ->belongsToMany(User::class, 'game_user')
            ->using(GamePlayer::class)
            ->withPivot(['id', 'state', 'result', 'left_at'])
            ->withTimestamps();
    }
}
