<?php

namespace App\Services\Game;

use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * @phpstan-type State array{id: string, version: int, bag: list<string>, owned: list<string>, board: list<string|null>, status: string, startedAt: int, finishedAt: int|null}
 */
class SoloGame
{
    public const DISTRIBUTION = ['A' => 13, 'B' => 3, 'C' => 3, 'D' => 6, 'E' => 18, 'F' => 3, 'G' => 4, 'H' => 3, 'I' => 12, 'J' => 2, 'K' => 2, 'L' => 5, 'M' => 3, 'N' => 8, 'O' => 11, 'P' => 3, 'Q' => 2, 'R' => 9, 'S' => 6, 'T' => 9, 'U' => 6, 'V' => 3, 'W' => 3, 'X' => 2, 'Y' => 3, 'Z' => 2];

    /** @return State */
    public function start(): array
    {
        $bag = [];
        foreach (self::DISTRIBUTION as $letter => $count) {
            $bag = [...$bag, ...array_fill(0, $count, $letter)];
        }
        shuffle($bag);
        $owned = array_splice($bag, 0, 21);

        return ['id' => (string) Str::uuid(), 'version' => 0, 'bag' => $bag, 'owned' => $owned, 'board' => array_fill(0, 225, null), 'status' => 'active', 'startedAt' => time(), 'finishedAt' => null];
    }

    /**
     * @param  State  $state
     * @param  list<string|null>  $board
     * @return list<string>
     */
    public function rack(array $state, array $board): array
    {
        $rack = $state['owned'];
        foreach ($board as $letter) {
            if ($letter === null) {
                continue;
            }
            $index = array_search($letter, $rack, true);
            if ($index === false) {
                throw ValidationException::withMessages(['board' => 'The board contains a tile you do not own.']);
            }
            unset($rack[$index]);
        }

        return array_values($rack);
    }

    /**
     * @param  State  $state
     * @param  list<string|null>  $board
     * @return State
     */
    public function act(array $state, array $board, string $action, ?string $letter, BoardValidator $validator): array
    {
        if ($state['status'] !== 'active') {
            throw ValidationException::withMessages(['game' => 'This game has already finished.']);
        }
        $rack = $this->rack($state, $board);
        $state['board'] = $board;
        if ($action === 'peel') {
            $validation = $validator->validate($board);
            if ($rack !== []) {
                throw ValidationException::withMessages(['rack' => 'Use all your rack tiles before peeling.']);
            }
            if (! $validation['valid']) {
                throw ValidationException::withMessages(['board' => $validation['message']]);
            }
            if ($state['bag'] === []) {
                $state['status'] = 'completed';
                $state['finishedAt'] = time();
            } else {
                $state['owned'][] = array_pop($state['bag']);
            }
        } elseif ($action === 'exchange') {
            if ($letter === null || ! in_array($letter, $rack, true)) {
                throw ValidationException::withMessages(['letter' => 'Select a tile from your rack to exchange.']);
            }
            if (count($state['bag']) < 3) {
                throw ValidationException::withMessages(['bag' => 'At least three tiles must remain to exchange.']);
            }
            $index = array_search($letter, $state['owned'], true);
            if ($index === false) {
                throw new \LogicException('Owned tile missing.');
            }
            unset($state['owned'][$index]);
            $state['owned'] = [...array_values($state['owned']), ...array_splice($state['bag'], 0, 3)];
            $state['bag'][] = $letter;
            shuffle($state['bag']);
        }
        $state['version']++;

        return $state;
    }

    /**
     * @param  State  $state
     * @return array{id: string, version: int, tiles: list<string>, board: list<string|null>, remaining: int, status: string, elapsed: int}
     */
    public function present(array $state): array
    {
        return ['id' => $state['id'], 'version' => $state['version'], 'tiles' => $this->rack($state, $state['board']), 'board' => $state['board'], 'remaining' => count($state['bag']), 'status' => $state['status'], 'elapsed' => max(0, ($state['finishedAt'] ?? time()) - $state['startedAt'])];
    }
}
