<?php

namespace App\Http\Controllers\Game;

use App\Http\Controllers\Controller;
use App\Services\Game\BoardValidator;
use App\Services\Game\SoloGame;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** @phpstan-import-type State from SoloGame */
class SoloGameController extends Controller
{
    public function show(Request $request, SoloGame $game): Response
    {
        /** @var State|null $state */
        $state = $request->session()->get('solo');

        return Inertia::render('game/singleplayer', ['initialGame' => $state ? $game->present($state) : null]);
    }

    public function action(Request $request, SoloGame $game, BoardValidator $validator): JsonResponse
    {
        $data = $request->validate([
            'action' => ['required', 'in:start,check,peel,exchange,quit'],
            'id' => ['nullable', 'uuid'],
            'version' => ['nullable', 'integer', 'min:0'],
            'board' => ['required_unless:action,start,quit', 'array', 'list', 'size:225'],
            'board.*' => ['nullable', 'string', 'regex:/^[A-Z]$/'],
            'letter' => ['nullable', 'string', 'regex:/^[A-Z]$/'],
        ]);
        /** @var State|null $state */
        $state = $request->session()->get('solo');
        if ($state !== null && ($data['id'] ?? null) !== $state['id'] || $state !== null && ($data['version'] ?? null) !== $state['version']) {
            return response()->json(['message' => 'This game changed in another request. Reload to continue.', 'game' => $game->present($state)], 409);
        }
        if ($data['action'] === 'start') {
            $state = $game->start();
        } elseif ($state === null) {
            return response()->json(['message' => 'Your game session expired. Start a new game.'], 409);
        } elseif ($data['action'] === 'quit') {
            $request->session()->forget('solo');

            return response()->json(['game' => null]);
        } else {
            $state = $game->act($state, $data['board'], $data['action'], $data['letter'] ?? null, $validator);
        }
        $request->session()->put('solo', $state);

        return response()->json(['game' => $game->present($state), 'validation' => $data['action'] === 'check' ? $validator->validate($state['board']) : null]);
    }
}
