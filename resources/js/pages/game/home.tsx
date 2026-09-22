import { Head, Link } from '@inertiajs/react';

export default function Home() {
    return (
        <main className="home-page">
            <Head title="Bananagrams" />
            <h1>Welcome to Bananagrams</h1>
            <div className="actions">
                <Link href="/bananagrams">Multiplayer Game</Link>
                <Link href="/singleplayer">Single Player Game</Link>
            </div>
            <p className="notice">
                Game screens are available to preview. Online play and scoring
                are coming soon.
            </p>
            <section className="leaderboard">
                <h2>Leaderboard - Top Players</h2>
                <p>Rankings are not available yet.</p>
            </section>
        </main>
    );
}
