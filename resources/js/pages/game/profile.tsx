import { Head, usePage } from '@inertiajs/react';
export default function Profile() {
    const { auth } = usePage().props;
    return (
        <main className="profile-page">
            <Head title="Player Profile" />
            <h1>Statistics for {auth.user.name}</h1>
            <p className="stats-title">Your Performance</p>
            <p className="notice">Game statistics are not connected yet.</p>
        </main>
    );
}
