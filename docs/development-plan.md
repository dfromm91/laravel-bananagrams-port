# Development baseline and staged plan

## Step 1 audit — 2026-09-22

Starting commit: `413a533` (`FE added`). The working tree was clean at the start of this audit. The frontend integration and drag fix were already committed; this step records the baseline rather than duplicating that commit.

### Present and verified

- Laravel 13 with React 19, Inertia, TypeScript, and Vite.
- Fortify login, registration, password reset, and email-verification configuration.
- SQLite users, games, and game_user migrations are already applied. No live migrations were run during this audit.
- Game homepage, rules, multiplayer placeholder, authenticated profile placeholder, and single-player board preview.
- Rack-to-board and board-to-board movement handlers, plus a return-to-rack handler. Prior browser verification confirmed board-to-board dragging; automated native drags back to the rack were inconclusive, so this interaction needs explicit regression coverage before gameplay is considered complete.
- No old Socket.IO, Google ID, JWT, or external backend fetch references found in resources/js.

### Missing functionality

The original client repository supplies UI and socket contracts, not the old server implementation. Tile distribution, dictionary choice, and authoritative rule handling cannot be recovered from the client alone.

- Real tile bag, shuffle/deal, peel, exchange, connected-board and dictionary validation.
- Game completion, elapsed time, reset, quit confirmation, and useful validation feedback.
- Saving/resuming games and participant state.
- Multiplayer room creation, joining, capacity enforcement, synchronized state, reconnects, and departure policy.
- Exactly-once result accounting, profiles, rankings, and single-player best times.
- Actual email transport: MAIL_MAILER is currently log.
- Account deletion policy: participant foreign keys currently restrict deleting users with game history.
- Authorization and concurrency rules: models alone do not enforce membership, maximum players, tile ownership, or legal transitions. SQLite requires a concurrency approach that does not assume row-level SELECT FOR UPDATE locking.

### Proposed decisions for approval before implementation

- Keep Laravel/Inertia and extract understandable board, rack, and tile components from the preview. Preserve the existing visual style.
- Put game rules in testable PHP services so single-player and multiplayer use the same rules. React handles interaction and displays results.
- Retain the 15-by-15 board initially; larger boards can be a separate feature.
- Confirm an English word list and its redistribution license, initial tile distribution, starting rack size, and single-player completion rule before implementing validation. The original UI describes exchanging one tile for three and peeling only after all tiles form a valid connected crossword.
- Decide whether solo play requires an account and whether solo completions affect wins/losses. Recommended: multiplayer results determine wins/losses; solo games track completion time separately.
- Use SQLite first. Select polling or WebSockets for multiplayer based on the intended deployment; do not require Redis prematurely.
- Hosting target and email provider remain undecided. No deployment or outbound mail setup is included in the baseline.

## Approval checkpoints

1. Audit, checks, and baseline commit (this step).
2. Playable single-player rules and interface, with interaction and rules tests.
3. Persistent games and safe save/resume behavior.
4. Multiplayer rooms and synchronization.
5. Results, profiles, leaderboards, and registration email delivery.
6. End-to-end verification and operating/deployment documentation.

At each checkpoint: explain changes, verify them, commit locally, then pause for user approval. Do not push or deploy without approval.

## Verification results

- Frontend formatting and lint: pass (`npm run check`).
- TypeScript: pass (`npm run types:check`).
- Production build: pass (`npm run build`).
- PHP formatting: pass after import ordering and migration brace cleanup.
- PHPUnit: 34 passed, 3 skipped, 123 assertions. Tests use the configured in-memory SQLite test database, not live game data.
- Static analysis: relationship generic annotations added. One pre-existing failure remains: `UserFactory::withTwoFactor()` is empty despite declaring a return value. Two-factor support is disabled; restoring that feature requires consistent model/schema/configuration changes, not a dummy return. This baseline is not a fully green CI baseline.
- PHPStan required `--debug --memory-limit=512M` in this environment to avoid a blocked local worker socket and the CLI's default memory limit.

This commit makes no gameplay or schema behavior changes. It records the audit and applies formatting/type-documentation cleanup only.
