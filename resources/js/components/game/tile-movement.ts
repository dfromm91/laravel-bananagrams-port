import type { TileSource } from './types';

export type TileLayout = {
    tiles: (string | null)[];
    board: (string | null)[];
};

/** Move one tile without replacing occupied squares or changing the tile count. */
export function moveTile(
    layout: TileLayout,
    source: TileSource,
    destination: TileSource,
): TileLayout {
    const origin = source.location === 'rack' ? layout.tiles : layout.board;
    if (
        !Number.isInteger(source.index) ||
        source.index < 0 ||
        !origin[source.index]
    )
        return layout;
    if (destination.location === 'rack' && source.location === 'rack')
        return layout;
    if (
        destination.location === 'board' &&
        (!Number.isInteger(destination.index) ||
            destination.index < 0 ||
            destination.index >= layout.board.length ||
            layout.board[destination.index] !== null)
    )
        return layout;

    const tiles = [...layout.tiles];
    const board = [...layout.board];
    const letter = origin[source.index];
    if (source.location === 'rack') tiles[source.index] = null;
    else board[source.index] = null;
    if (destination.location === 'rack') tiles.push(letter);
    else board[destination.index] = letter;
    return { tiles, board };
}
