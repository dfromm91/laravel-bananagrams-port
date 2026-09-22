import assert from 'node:assert/strict';
import { test } from 'node:test';
import { moveTile } from '../../resources/js/components/game/tile-movement.ts';

const initial = () => ({
    tiles: ['A', 'A', 'B'],
    board: Array(225).fill(null),
});
const rack = (index) => ({ location: 'rack', index });
const board = (index) => ({ location: 'board', index });
const letters = (state) =>
    [...state.tiles, ...state.board].filter(Boolean).sort();

test('rack to board to board to rack preserves repeated letters and originals', () => {
    const start = initial();
    let state = moveTile(start, rack(1), board(0));
    assert.equal(state.board[0], 'A');
    assert.deepEqual(state.tiles, ['A', null, 'B']);
    state = moveTile(state, board(0), board(224));
    assert.equal(state.board[0], null);
    assert.equal(state.board[224], 'A');
    state = moveTile(state, board(224), rack(0));
    assert.equal(state.board[224], null);
    assert.deepEqual(letters(state), letters(start));
    assert.deepEqual(start, initial());
});

test('occupied, identical, missing and out-of-range moves leave state untouched', () => {
    const state = moveTile(initial(), rack(0), board(0));
    for (const [from, to] of [
        [rack(2), board(0)],
        [board(0), board(0)],
        [rack(0), board(1)],
        [rack(-1), board(1)],
        [rack(99), board(1)],
        [rack(1), board(225)],
        [rack(1), board(-1)],
        [rack(1), rack(0)],
    ]) {
        assert.equal(moveTile(state, from, to), state);
    }
});

test('last rack tile can be placed then returned to an empty rack', () => {
    const state = moveTile(
        { tiles: ['Z'], board: Array(225).fill(null) },
        rack(0),
        board(7),
    );
    assert.equal(state.tiles.filter(Boolean).length, 0);
    const returned = moveTile(state, board(7), rack(0));
    assert.deepEqual(letters(returned), ['Z']);
    assert.equal(returned.board.filter(Boolean).length, 0);
});
