<?php

namespace App\Services\Game;

class BoardValidator
{
    public function __construct(private WordDictionary $dictionary) {}

    /**
     * @param  list<string|null>  $board
     * @return array{valid: bool, connected: bool, invalidWords: list<string>, invalidCells: list<int>, message: string}
     */
    public function validate(array $board): array
    {
        $occupied = array_keys(array_filter($board));
        $visited = [];
        $queue = $occupied === [] ? [] : [$occupied[0]];
        while ($queue !== []) {
            $cell = array_pop($queue);
            if (isset($visited[$cell])) {
                continue;
            }
            $visited[$cell] = true;
            $neighbors = [];
            if ($cell % 15 > 0) {
                $neighbors[] = $cell - 1;
            }
            if ($cell % 15 < 14) {
                $neighbors[] = $cell + 1;
            }
            if ($cell >= 15) {
                $neighbors[] = $cell - 15;
            }
            if ($cell < 210) {
                $neighbors[] = $cell + 15;
            }
            foreach ($neighbors as $neighbor) {
                if ($board[$neighbor] !== null && ! isset($visited[$neighbor])) {
                    $queue[] = $neighbor;
                }
            }
        }
        $connected = $occupied !== [] && count($visited) === count($occupied);
        $invalidWords = [];
        $invalidCells = [];
        $wordCount = 0;
        foreach ([1, 15] as $step) {
            foreach ($occupied as $start) {
                $hasPrevious = $step === 1 ? $start % 15 > 0 : $start >= 15;
                if ($hasPrevious && $board[$start - $step] !== null) {
                    continue;
                }
                $cells = [];
                $word = '';
                for ($i = $start; $i < 225 && $board[$i] !== null; $i += $step) {
                    if ($step === 1 && intdiv($i, 15) !== intdiv($start, 15)) {
                        break;
                    }
                    $cells[] = $i;
                    $word .= $board[$i];
                }
                if (count($cells) < 2) {
                    continue;
                }
                $wordCount++;
                if (! $this->dictionary->contains($word)) {
                    $invalidWords[] = $word;
                    $invalidCells = [...$invalidCells, ...$cells];
                }
            }
        }
        $valid = $connected && $wordCount > 0 && $invalidWords === [];
        $message = ! $connected ? 'All tiles must form one connected crossword.' : ($wordCount === 0 ? 'Make a word of at least two letters.' : ($invalidWords !== [] ? 'Some words are not in the ENABLE dictionary.' : 'Your crossword is valid.'));

        return ['valid' => $valid, 'connected' => $connected, 'invalidWords' => array_values(array_unique($invalidWords)), 'invalidCells' => array_values(array_unique($invalidCells)), 'message' => $message];
    }
}
