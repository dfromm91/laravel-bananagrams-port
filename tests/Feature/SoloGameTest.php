<?php

namespace Tests\Feature;

use App\Services\Game\BoardValidator;
use App\Services\Game\SoloGame;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SoloGameTest extends TestCase
{
    use RefreshDatabase;

    public function test_deal_has_exact_distribution_and_does_not_expose_bag(): void
    {
        $this->postJson('/singleplayer/action', ['action' => 'start'])->assertOk()->assertJsonPath('game.remaining', 123)->assertJsonCount(21, 'game.tiles')->assertJsonMissingPath('game.bag');
        $state = session('solo');
        $counts = array_count_values([...$state['bag'], ...$state['owned']]);
        ksort($counts);
        $this->assertSame(SoloGame::DISTRIBUTION, $counts);
        $this->assertDatabaseCount('games', 0);
    }

    public function test_exchange_preserves_tiles_and_replay_is_rejected(): void
    {
        $state = app(SoloGame::class)->start();
        $request = ['action' => 'exchange', 'id' => $state['id'], 'version' => 0, 'board' => $state['board'], 'letter' => $state['owned'][0]];
        $this->withSession(['solo' => $state])->postJson('/singleplayer/action', $request)->assertOk()->assertJsonPath('game.remaining', 121)->assertJsonCount(23, 'game.tiles');
        $updated = session('solo');
        $before = [...$state['bag'], ...$state['owned']];
        $after = [...$updated['bag'], ...$updated['owned']];
        sort($before);
        sort($after);
        $this->assertSame($before, $after);
        $this->postJson('/singleplayer/action', $request)->assertStatus(409);
    }

    public function test_forged_tiles_and_malformed_boards_are_rejected(): void
    {
        $state = app(SoloGame::class)->start();
        $state['owned'] = ['C', 'A', 'T'];
        $board = array_fill(0, 225, null);
        $board[0] = 'Z';
        $request = ['action' => 'check', 'id' => $state['id'], 'version' => 0, 'board' => $board];
        $this->withSession(['solo' => $state])->postJson('/singleplayer/action', $request)->assertUnprocessable();
        $request['board'] = ['C'];
        $this->postJson('/singleplayer/action', $request)->assertUnprocessable();
        $request['board'] = array_fill(0, 225, null);
        $request['board'][0] = 'CAT';
        $this->postJson('/singleplayer/action', $request)->assertUnprocessable();
    }

    public function test_peel_requires_empty_rack_and_valid_board_and_completes_once(): void
    {
        $state = app(SoloGame::class)->start();
        $state['owned'] = ['C', 'A', 'T'];
        $state['bag'] = [];
        $request = ['action' => 'peel', 'id' => $state['id'], 'version' => 0, 'board' => $state['board']];
        $this->withSession(['solo' => $state])->postJson('/singleplayer/action', $request)->assertUnprocessable();
        $request['board'][0] = 'C';
        $request['board'][1] = 'T';
        $request['board'][2] = 'A';
        $this->postJson('/singleplayer/action', $request)->assertUnprocessable();
        $request['board'][1] = 'A';
        $request['board'][2] = 'T';
        $this->postJson('/singleplayer/action', $request)->assertOk()->assertJsonPath('game.status', 'completed');
        $request['version'] = 1;
        $this->postJson('/singleplayer/action', $request)->assertUnprocessable();
        $this->assertDatabaseCount('games', 0);
    }

    public function test_peel_draws_one_and_exchange_requires_three_remaining(): void
    {
        $state = app(SoloGame::class)->start();
        $state['owned'] = ['C', 'A', 'T'];
        $state['bag'] = ['S'];
        $board = array_fill(0, 225, null);
        $board[0] = 'C';
        $board[1] = 'A';
        $board[2] = 'T';
        $this->withSession(['solo' => $state])->postJson('/singleplayer/action', ['action' => 'peel', 'id' => $state['id'], 'version' => 0, 'board' => $board])->assertOk()->assertJsonPath('game.tiles', ['S'])->assertJsonPath('game.remaining', 0)->assertJsonPath('game.status', 'active');
        $this->postJson('/singleplayer/action', ['action' => 'exchange', 'id' => $state['id'], 'version' => 1, 'board' => $board, 'letter' => 'S'])->assertUnprocessable();
    }

    public function test_validation_checks_crossings_connectivity_and_row_boundaries(): void
    {
        $validator = app(BoardValidator::class);
        $board = array_fill(0, 225, null);
        $board[0] = 'C';
        $board[1] = 'A';
        $board[2] = 'T';
        $board[15] = 'A';
        $board[30] = 'R';
        $this->assertTrue($validator->validate($board)['valid']);
        $board[30] = 'Z';
        $result = $validator->validate($board);
        $this->assertFalse($result['valid']);
        $this->assertContains('CAZ', $result['invalidWords']);
        $this->assertContains(30, $result['invalidCells']);
        $board = array_fill(0, 225, null);
        $board[14] = 'A';
        $board[15] = 'T';
        $this->assertFalse($validator->validate($board)['connected']);
        $this->assertFalse($validator->validate(array_fill(0, 225, null))['valid']);
        $board = array_fill(0, 225, null);
        $board[0] = 'A';
        $this->assertFalse($validator->validate($board)['valid']);
    }

    public function test_check_saves_arrangement_and_quit_clears_session(): void
    {
        $state = app(SoloGame::class)->start();
        $state['board'][0] = $state['owned'][0];
        $this->withSession(['solo' => $state])->postJson('/singleplayer/action', ['action' => 'check', 'id' => $state['id'], 'version' => 0, 'board' => $state['board']])->assertOk()->assertJsonPath('game.version', 1);
        $this->assertSame($state['board'], session('solo')['board']);
        $this->postJson('/singleplayer/action', ['action' => 'quit', 'id' => $state['id'], 'version' => 1])->assertOk()->assertJsonPath('game', null);
        $this->assertNull(session('solo'));
    }
}
