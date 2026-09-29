# Conventions (target state — being migrated toward)

## Client data fetching
Use a shared helper instead of hand-rolled fetch blocks:
```ts
import { apiGet, apiPost } from '@/app/util/apiClient';
const stats = await apiGet<UserStats>(`stats/user/${userId}`, { token: userToken });
```
Do NOT copy-paste the `fetch(...).then(data => {...})` boilerplate seen in older
pages — extract to `app/util/apiClient.ts` as routes are touched.

## API routes (server side)
Use `proxyFetch` from `app/util/apiProxy.ts` instead of duplicating the
`process.env.API_URL` fetch + status-check logic in every `route.tsx`.

## API migration compatibility
The Go API is replacing a legacy Python API. New frontend consumers should
prefer the Go object shape, but must accept documented legacy shapes while the
migration is active. Normalize response variants in `app/util/` or another
feature boundary before rendering; do not add repeated tuple/index checks in
JSX. For example, event deck records are normalized by
`app/util/deckCompatibility.ts` because legacy responses can use
`[deck, commanderCard]` tuples while the Go API returns plain deck objects.

When touching a shared API response, check both forms, preserve valid empty or
partial records, and update `RumbleAPI/API_COMPATIBILITY.md` plus
`RumbleSite/docs/API.md` if the contract changes.

## Error handling convention
- `proxyFetch` forwards the upstream API's real HTTP status code and JSON body
  as-is (success or error) — routes should not swallow or remap status codes.
- Client-side `apiClient.ts` throws an `Error` for any response with
  `status >= 400`; callers should `.catch()` or let it surface to an error
  boundary rather than checking `res.ok` manually.
- For request validation errors (bad input from the browser, not upstream
  errors), return `400` with `{ error, issues? }` — see `app/util/validate.ts`.

## Request validation
For routes accepting user-supplied input, validate with `zod` via
`parseBody(request, schema)` from `app/util/validate.ts` before proxying:
```ts
const parsed = await parseBody(request, mySchema);
if ("error" in parsed) return parsed.error;
return proxyFetch(request, "/path", { body: parsed.data });
```
See `app/api/login/route.tsx` for the reference implementation. Not yet applied
to every route — add validation opportunistically as routes are touched,
prioritizing routes that accept free-form user input (usernames, passwords,
decklist text).

## Types
Prefer explicit interfaces in `app/types/*.ts` over `any`. Priority order when
refactoring a file: replace `any` props/state with typed interfaces for Deck,
Event, Card, UserStats, GlobalStats as they're touched.

## Components
- Client components must start with `'use client'`.
- Keep presentational sub-components (e.g. `ColorStat`, `IcoCard`) local unless
  reused across >1 route, then move to `app/components/`.
- Avoid `document.getElementById(...)` for form values — use controlled inputs
  with `useState` (already the dominant pattern; a few older pages still use
  `getElementById`, fix opportunistically).

## Styling
See [STYLE-GUIDE.md](./STYLE-GUIDE.md) for concrete UI patterns (cards, color
identity strips, stats blocks, tables, dropdowns/modals, realtime refresh).
Tailwind 4 + daisyUI 5 classes directly in JSX. No CSS modules. Keep daisyUI
theme list (in `app/profile/page.tsx`) as the single source — don't duplicate.

## Env vars
See `.env.example`. `API_URL` (external backend base URL), `HOST_URL`
(websocket host). `LOCAL_URL` exists in `.env` but is currently unused in code
— confirm before relying on it. Access only via `process.env.*`; do not
hardcode.

## Linting / formatting
Run `npm run lint` and `npm run format` before committing. Prettier config is
in `.prettierrc.json` (`eslint-config-prettier` disables conflicting ESLint
style rules). Note: the existing codebase has not been bulk-reformatted yet
(would produce a large unrelated diff) — format files as you touch them, or
run `npm run format` repo-wide in its own dedicated commit when convenient.

## Naming
Routes/files use lowercase, no dashes (`bulktokens`, `fromdecklist`) — match
existing style for consistency, don't introduce kebab-case for new folders.

## Stats privacy (product rule)
Players must never see another player's wins, win rate, or placements.
- Own stats (`/stats`, or `/stats/users/{me}`) may show wins, win rates, placements, and color win rates.
- Other players (`/stats/users/{id}`, Players list) show only non-performance data: games played, kills, commanders played, last played.
- Enforced in the API (`canViewPrivateStats` in `RumbleAPI/routes/stats.go`): `/stats/user/:id/simple` returns 403 for other users, `/stats/users/:id` omits commander `wins`, and `/stats/users` never includes wins. Admins can view all.
- Aggregate card/global stats (no per-player breakdown) are fine to show.
