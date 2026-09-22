import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import GameBoard from '@/components/game/game-board';
import TileRack from '@/components/game/tile-rack';
import { moveTile } from '@/components/game/tile-movement';
import type { TileSource } from '@/components/game/types';

type Game = {
    id: string;
    version: number;
    tiles: string[];
    board: (string | null)[];
    remaining: number;
    status: 'active' | 'completed';
    elapsed: number;
};
type Validation = {
    valid: boolean;
    message: string;
    invalidWords: string[];
    invalidCells: number[];
};
type Action = 'start' | 'check' | 'peel' | 'exchange' | 'quit';

export default function SinglePlayer({
    initialGame,
}: {
    initialGame: Game | null;
}) {
    const [game, setGame] = useState(initialGame);
    const [layout, setLayout] = useState({
        tiles: initialGame?.tiles ?? [],
        board: initialGame?.board ?? Array<string | null>(225).fill(null),
    } as { tiles: (string | null)[]; board: (string | null)[] });
    const [selected, setSelected] = useState<number | null>(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const [validation, setValidation] = useState<Validation | null>(null);
    const [confirmation, setConfirmation] = useState<'start' | 'quit' | null>(
        null,
    );
    const [elapsed, setElapsed] = useState(initialGame?.elapsed ?? 0);
    const dragged = useRef<TileSource | null>(null);
    const inFlight = useRef(false);
    const active = game?.status === 'active';

    useEffect(() => {
        if (!active) return;
        const timer = window.setInterval(
            () => setElapsed((value) => value + 1),
            1000,
        );
        return () => window.clearInterval(timer);
    }, [active]);

    function move(source: TileSource | null, destination: TileSource) {
        if (!source || busy || !active) return;
        setLayout((current) => moveTile(current, source, destination));
        setSelected(null);
        setValidation(null);
        setMessage('');
    }

    function startDrag(
        event: DragEvent<HTMLButtonElement>,
        source: TileSource,
    ) {
        if (busy || !active) {
            event.preventDefault();
            return;
        }
        dragged.current = source;
        setSelected(null);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', JSON.stringify(source));
    }

    async function act(action: Action) {
        if (inFlight.current) return;
        inFlight.current = true;
        setBusy(true);
        setMessage('');
        setConfirmation(null);
        try {
            const cookie = document.cookie
                .split('; ')
                .find((value) => value.startsWith('XSRF-TOKEN='));
            const response = await fetch('/singleplayer/action', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': cookie
                        ? decodeURIComponent(cookie.slice('XSRF-TOKEN='.length))
                        : '',
                },
                body: JSON.stringify({
                    action,
                    id: game?.id,
                    version: game?.version,
                    board: layout.board,
                    letter: selected === null ? null : layout.tiles[selected],
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                const details = data.errors
                    ? Object.values(data.errors).flat().join(' ')
                    : data.message;
                throw new Error(
                    response.status === 419
                        ? 'Your session expired. Reload this page before continuing.'
                        : details || 'Could not update your game.',
                );
            }
            const next: Game | null = data.game;
            setGame(next);
            setLayout({
                tiles: next?.tiles ?? [],
                board: next?.board ?? Array<string | null>(225).fill(null),
            });
            setElapsed(next?.elapsed ?? 0);
            setSelected(null);
            setValidation(data.validation ?? null);
            setMessage(
                next?.status === 'completed'
                    ? 'Bananas! You used every tile in a valid crossword.'
                    : (data.validation?.message ??
                          (action === 'exchange'
                              ? 'Exchanged one tile for three.'
                              : action === 'peel'
                                ? 'One new tile drawn.'
                                : '')),
            );
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : 'Connection failed. Try again.',
            );
        } finally {
            inFlight.current = false;
            setBusy(false);
        }
    }

    const time = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;
    return (
        <main className="app">
            <Head title="Single Player" />
            <h1>Single Player</h1>
            <p className="notice">
                Build a connected crossword using every tile. Select or drag a
                rack tile onto the board. Drag placed tiles to move them, or
                select one to return it to the rack.
            </p>
            <p className="notice">
                Word list: ENABLE2K. Session game only; account saves and
                rankings are coming later. Use Check words before leaving to
                keep your current arrangement in this session.
            </p>
            {!game ? (
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => void act('start')}
                >
                    Start game — 21 tiles
                </button>
            ) : (
                <>
                    <p className="game-summary">
                        Tiles in bag: {game.remaining} · In rack:{' '}
                        {layout.tiles.filter(Boolean).length} · Time: {time}
                    </p>
                    <fieldset
                        className="play-area"
                        disabled={busy || !active}
                        aria-label="Game tiles"
                    >
                        <TileRack
                            tiles={layout.tiles}
                            selected={selected}
                            onSelect={setSelected}
                            onDragStart={startDrag}
                            onDragEnd={() => {
                                dragged.current = null;
                            }}
                            onDrop={() => {
                                const source = dragged.current;
                                dragged.current = null;
                                move(source, { location: 'rack', index: 0 });
                            }}
                        />
                        <GameBoard
                            board={layout.board}
                            invalidCells={validation?.invalidCells}
                            onSelect={(index) =>
                                layout.board[index]
                                    ? move(
                                          { location: 'board', index },
                                          { location: 'rack', index: 0 },
                                      )
                                    : move(
                                          selected === null
                                              ? null
                                              : {
                                                    location: 'rack',
                                                    index: selected,
                                                },
                                          { location: 'board', index },
                                      )
                            }
                            onDragStart={startDrag}
                            onDragEnd={() => {
                                dragged.current = null;
                            }}
                            onDrop={(index) => {
                                const source = dragged.current;
                                dragged.current = null;
                                move(source, { location: 'board', index });
                            }}
                        />
                    </fieldset>
                    <div className="game-controls">
                        <button
                            type="button"
                            disabled={busy || !active}
                            onClick={() => void act('check')}
                        >
                            Check words
                        </button>
                        <button
                            type="button"
                            disabled={
                                busy || !active || layout.tiles.some(Boolean)
                            }
                            onClick={() => void act('peel')}
                        >
                            {game.remaining === 0 ? 'Finish game' : 'Peel'}
                        </button>
                        <button
                            type="button"
                            disabled={
                                busy ||
                                !active ||
                                selected === null ||
                                game.remaining < 3
                            }
                            onClick={() => void act('exchange')}
                        >
                            Bunch — exchange selected tile
                        </button>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => setConfirmation('start')}
                        >
                            New game
                        </button>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => setConfirmation('quit')}
                        >
                            Quit game
                        </button>
                    </div>
                    <p className="notice">
                        Bunch returns one rack tile and draws three; it requires
                        at least three tiles in the bag. Peel requires an empty
                        rack and valid words.
                    </p>
                </>
            )}
            {confirmation && (
                <section
                    className="game-confirmation"
                    role="alertdialog"
                    aria-label="Confirm game change"
                >
                    <p>
                        {confirmation === 'start'
                            ? 'Discard this game and deal a new one?'
                            : 'Quit and discard this session game?'}
                    </p>
                    <button
                        type="button"
                        onClick={() => void act(confirmation)}
                    >
                        Yes, continue
                    </button>
                    <button type="button" onClick={() => setConfirmation(null)}>
                        Cancel
                    </button>
                </section>
            )}
            <p className="notice" role="status">
                {busy ? 'Updating game…' : message}
            </p>
            {validation && validation.invalidWords.length > 0 && (
                <p className="notice">
                    Unrecognized words: {validation.invalidWords.join(', ')}
                </p>
            )}
        </main>
    );
}
