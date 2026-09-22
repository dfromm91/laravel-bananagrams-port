import type { DragEvent } from 'react';
import type { TileSource } from './types';

type Props = {
    tiles: (string | null)[];
    selected: number | null;
    onSelect: (index: number) => void;
    onDragStart: (
        event: DragEvent<HTMLButtonElement>,
        source: TileSource,
    ) => void;
    onDragEnd: () => void;
    onDrop: () => void;
};

export default function TileRack({
    tiles,
    selected,
    onSelect,
    onDragStart,
    onDragEnd,
    onDrop,
}: Props) {
    return (
        <div
            className="tileRack"
            aria-label="Tile rack"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
                event.preventDefault();
                onDrop();
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
                            onClick={() => onSelect(index)}
                            draggable
                            onDragStart={(event) =>
                                onDragStart(event, { location: 'rack', index })
                            }
                            onDragEnd={onDragEnd}
                        >
                            {letter}
                        </button>
                    ),
            )}
        </div>
    );
}
