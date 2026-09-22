import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import '../../css/game.css';

export default function GameLayout({ children }: PropsWithChildren) {
    const { auth } = usePage().props;
    return (
        <div className="game-surface">
            <nav className="top-bar" aria-label="Game navigation">
                <Link href="/">Home</Link>
                <Link href="/rules">How to Play</Link>
                {auth.user ? (
                    <>
                        <Link href="/profile">Profile</Link>
                        <Link href="/dashboard">Dashboard</Link>
                    </>
                ) : (
                    <>
                        <Link href="/login">Log in</Link>
                        <Link href="/register">Register</Link>
                    </>
                )}
            </nav>
            {children}
        </div>
    );
}
