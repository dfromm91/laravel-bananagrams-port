<?php

namespace App\Services\Game;

class WordDictionary
{
    /** @var array<string, true>|null */
    private ?array $words = null;

    public function contains(string $word): bool
    {
        if ($this->words === null) {
            $lines = file(resource_path('dictionaries/enable2k.txt'), FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if ($lines === false) {
                throw new \RuntimeException('The game dictionary is unavailable.');
            }
            $this->words = array_fill_keys($lines, true);
        }

        return isset($this->words[strtolower($word)]);
    }
}
