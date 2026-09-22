import type { DragEvent } from 'react';
import type { TileSource } from './types';

type Props = {
    board: (string | null)[];
    invalidCells?: number[];
    onSelect: (index: number) => void;
    onDragStart: (
        event: DragEvent<HTMLButtonElement>,
        source: TileSource,
    ) => void;
    onDragEnd: () => void;
    onDrop: (index: number) => void;
};

export default function GameBoard({
    board,
    invalidCells = [],
    onSelect,
    onDragStart,
    onDragEnd,
    onDrop,
}: Props) {
    return (
        <div className="board-scroll">
            <div className="grid" aria-label="Game board">
                {Array.from({ length: 15 }, (_, row) => (
                    <div className="grid-row" key={row}>
                        {Array.from({ length: 15 }, (_, col) => {
                            const index = row * 15 + col;
                            return (
                                <button
                                    type="button"
                                    key={col}
                                    className={`grid-cell ${invalidCells.includes(index) ? 'tile invalid-word' : board[index] ? 'tile' : ''}`}
                                    aria-label={`Row ${row + 1}, column ${col + 1}: ${board[index] ?? 'empty'}`}
                                    onClick={() => onSelect(index)}
                                    draggable={board[index] !== null}
                                    onDragStart={(event) =>
                                        onDragStart(event, {
                                            location: 'board',
                                            index,
                                        })
                                    }
                                    onDragEnd={onDragEnd}
                                    onDragOver={(event) =>
                                        event.preventDefault()
                                    }
                                    onDrop={(event) => {
                                        event.preventDefault();
                                        onDrop(index);
                                    }}
                                >
                                    {board[index]}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
