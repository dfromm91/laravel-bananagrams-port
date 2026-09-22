import { Head } from '@inertiajs/react';
export default function Setup() {
    return (
        <main className="game-setup">
            <Head title="Multiplayer" />
            <h1>BANANAGRAMS</h1>
            <p id="room-notice">Multiplayer rooms are not available yet.</p>
            <fieldset disabled aria-describedby="room-notice">
                <label htmlFor="room">Room ID</label>
                <input
                    id="room"
                    type="text"
                    placeholder="Enter Room ID"
                    maxLength={20}
                />
                <label htmlFor="players">Number of players</label>
                <input
                    id="players"
                    type="number"
                    min={2}
                    max={4}
                    defaultValue={4}
                />
                <button type="button">Create Room</button>
            </fieldset>
            <h2>Open Rooms</h2>
            <p>Room listings will appear here when multiplayer is ready.</p>
        </main>
    );
}
