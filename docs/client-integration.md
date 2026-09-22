# Client integration

Adapted from https://github.com/dfromm91/Bananagrams-Client.git into Laravel's existing React/Inertia frontend.

Game pages live in resources/js/pages/game. The original client styles are scoped under .game-surface in resources/css/game.css; navigation uses Inertia instead of React Router. The original banana asset is retained in resources/js/assets.

The old external authentication, JWT storage, profile/leaderboard fetches, Socket.IO transport and reconnection code are not included. Laravel authentication remains intact. No additional npm dependencies are required.

The single-player screen is a local sample-tile board preview, not a complete game. Multiplayer creation/joining, tile dealing/exchange, validation, timers, persisted state, results and rankings still need Laravel implementation. Profile stats deliberately show an unavailable state rather than fabricated totals. Leaving the preview resets its local state.

Existing game/user models and migrations were not changed. Future game actions should enforce authentication, membership, capacity and concurrency on the server. No live game records are created by these screens.
