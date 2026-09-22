import { Head } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { DragEvent } from 'react';

type TileSource = { location: 'rack' | 'board'; index: number };

export default function SinglePlayer() {
    const dragged = useRef<TileSource | null>(null);
    const [selected, setSelected] = useState<number | null>(null);
    const [tiles, setTiles] = useState<(string | null)[]>([
        'B',
        'A',
        'N',
        'A',
        'N',
        'A',
    ]);
    const [board, setBoard] = useState<(string | null)[]>(
        Array(225).fill(null),
    );

    function startDrag(
        event: DragEvent<HTMLButtonElement>,
        source: TileSource,
    ) {
        dragged.current = source;
        setSelected(null);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', JSON.stringify(source));
    }

    function place(
        index: number,
        source: TileSource | null = selected === null
            ? null
            : { location: 'rack', index: selected },
    ) {
        if (!source || board[index] !== null) return;
        const letter =
            source.location === 'rack'
                ? tiles[source.index]
                : board[source.index];
        if (!letter) return;
        setBoard(
            board.map((tile, i) => {
                if (i === index) return letter;
                if (source.location === 'board' && i === source.index)
                    return null;
                return tile;
            }),
        );
        if (source.location === 'rack') {
            setTiles(
                tiles.map((tile, i) => (i === source.index ? null : tile)),
            );
        }
        setSelected(null);
    }

    function returnTile(index: number) {
        const letter = board[index];
        if (!letter) return;
        setSelected(null);
        setTiles([...tiles, letter]);
        setBoard(board.map((tile, i) => (i === index ? null : tile)));
    }

    return (
        <main className="app">
            <Head title="Single Player" />
            <h1>Single Player</h1>
            <p className="notice">
                Board preview only. Select a sample tile, then an empty square
                to place it. Drag tiles between squares or back to the rack.
                Select a placed tile to return it. Dealing, word checks, and
                scoring are not available yet.
            </p>
            <div
                className="tileRack"
                aria-label="Sample tile rack"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                    event.preventDefault();
                    const source = dragged.current;
                    dragged.current = null;
                    if (source?.location === 'board') returnTile(source.index);
                }}
            >
                {tiles.map(
                    (letter, index) =>
                        letter && (
                            <button
                                key={index}
                                type="button"
                                className="tile"
                                aria-pressed={selected === index}
                                onClick={() => setSelected(index)}
                                draggable
                                onDragStart={(event) =>
                                    startDrag(event, {
                                        location: 'rack',
                                        index,
                                    })
                                }
                                onDragEnd={() => {
                                    dragged.current = null;
                                }}
                            >
                                {letter}
                            </button>
                        ),
                )}
            </div>
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
                                        className={`grid-cell ${board[index] ? 'tile' : ''}`}
                                        aria-label={`Row ${row + 1}, column ${col + 1}${board[index] ? `: ${board[index]}` : ': empty'}`}
                                        onClick={() =>
                                            board[index]
                                                ? returnTile(index)
                                                : place(index)
                                        }
                                        draggable={board[index] !== null}
                                        onDragStart={(event) =>
                                            startDrag(event, {
                                                location: 'board',
                                                index,
                                            })
                                        }
                                        onDragEnd={() => {
                                            dragged.current = null;
                                        }}
                                        onDragOver={(event) =>
                                            event.preventDefault()
                                        }
                                        onDrop={(event) => {
                                            event.preventDefault();
                                            const source = dragged.current;
                                            dragged.current = null;
                                            place(index, source);
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
            <button type="button" disabled>
                Peel
            </button>
            <button type="button" disabled>
                Bunch
            </button>
        </main>
    );
}
