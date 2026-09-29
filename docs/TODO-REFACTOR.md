# Refactor / Security / Standardization TODO

## 1. Security & dependency updates
- [x] `npm audit fix` (2026-09-16): resolved all 16 advisories (1 critical on
      `next`, 11 high, 3 moderate, 1 low). `next` 16.0.10 -> 16.3.5,
      `js-cookie` 3.0.5 -> 3.0.8, `ws` -> 8.21.3, plus transitive fixes
      (minimatch, postcss, sharp, nanoid, js-yaml, brace-expansion, etc.).
      `npm audit` now reports 0 vulnerabilities.
      Caveat: bumping `next` broke `next-ws`'s internal patch (it modifies
      Next.js source); had to re-run `npx next-ws-cli@latest patch -y`
      (not officially tested past Next 15.1.6 but `npm run build` passes).
      Re-run the patch step after any future `next` version bump.
- [x] Server routes forward `request.headers` wholesale to the external API —
      fixed in `proxyFetch` (2026-09-16): strips `host`, `connection`,
      `content-length`, `cookie`, `transfer-encoding` before forwarding.
- [x] `app/api/ws/route.tsx` WS relay has no auth. Decision (2026-09-16):
      leave as-is, acceptable for internal use.
- [x] Cookie `userdata` (token, isadmin) has no `secure`/`httpOnly` flags.
      Decision (2026-09-16): leave as-is for now; revisit as a dedicated task
      if auth model changes (would require a server-set httpOnly cookie).

## 2. Bug fixes uncovered during refactor
- [x] Dead code `if (res.ok) ... else ...` (res already parsed JSON, `.ok`
      always undefined) — fixed as part of the `proxyFetch` migration in
      item 3 (2026-09-16). Verified via workspace-wide search: no remaining
      `res.ok` occurrences in `app/`.

## 3. Refactor targets
- [x] Extracted `app/util/apiProxy.ts`: single `proxyFetch(request, path, opts)`
      helper. All 28 `app/api/**/route.tsx` proxy routes migrated to it
      (2026-09-16). Fixes the dead `res.ok` branch — errors now return the
      real upstream status code + body instead of crashing/silently
      swallowing. `app/api/ws/route.tsx` untouched (not a proxy route).
- [x] Extracted `app/util/apiClient.ts`: `apiGet/apiPost/apiPut/apiDelete`
      client helpers. Migrated (2026-09-16): all 18 `page.tsx` files with
      hand-rolled `fetch('/api/...')` boilerplate now use it. No remaining
      `fetch(` calls in any `page.tsx` (verified via workspace search).
- [x] Added typed interfaces in `app/types/` (2026-09-16): `color.ts`, `user.ts`,
      `card.ts`, `deck.ts`, `event.ts`, `match.ts`, `stats.ts` + barrel `index.ts`.
      Shapes inferred from observed API responses. Applied to the clearest
      `apiClient` call sites (colors, events, themes, users, user/global stats,
      card stats) in decks/events/stats/profile/newdeck pages. Deeper JSX-level
      `any` usage (deck cardlists, match/performance objects) still untyped —
      apply opportunistically as those files are touched.
- [x] Deduped `ColorStat` (2026-09-16): extracted to `app/components/ColorStat.tsx`,
      removed local copies from `stats/page.tsx` and `stats/global/page.tsx`.
      Also fixed a latent image-path bug (`../../${imgname}` / bare `imgname`
      -> root-relative `/${imgname}`).
- [x] Replaced `document.getElementById(...).value` in `app/login/page.tsx`
      with controlled `username`/`password` state (2026-09-16). Remaining
      `getElementById` usages (modal open/close, focus-select listener) are
      legitimate per CONVENTIONS.md.

## 4. Standardization
- [x] Added Prettier + `eslint-config-prettier` (2026-09-16): `.prettierrc.json`,
      `.prettierignore`, `npm run format`/`format:check`. Existing code not
      bulk-reformatted yet (large unrelated diff) — format opportunistically
      or run `npm run format` in its own dedicated commit.
- [x] Added `.env.example` documenting `API_URL`, `LOCAL_URL` (unused), `HOST_URL`.
- [x] Documented error-handling convention in CONVENTIONS.md (status/body
      passthrough via `proxyFetch`, client throws on 4xx/5xx).
- [x] Added `zod` + `app/util/validate.ts` (`parseBody` helper). Rolled out
      (2026-09-16) to every route accepting a body: `login`, `deck`,
      `deck/[deckid]`, `deck/checker`, `events`, `match`, `performance`,
      `user`, `user/[username]/pass`, `cards/fromdecklist`,
      `cards/printfavorite`.

## Suggested order of work
1. Deps/security bump + re-audit (isolated, low risk).
2. Add `apiProxy`/`apiClient` helpers + migrate routes/pages incrementally
   (also fixes the `res.ok` bug for free).
3. Introduce shared types as routes are migrated.
4. Lint/format pass + `.env.example` once churn settles.

## 5. Code review findings (2026-09-16)
- [x] `npm run lint` (`next lint`) was completely broken — Next.js 16 removed
      the `next lint` CLI subcommand. Fixed: added flat-config `eslint.config.mjs`
      (using `eslint-config-next/core-web-vitals` + `eslint-config-prettier`),
      removed the old `.eslintrc.json`, and changed the `lint` script to run
      `eslint .` directly.
- [x] Fixed 6 ESLint errors surfaced once linting worked again:
      - `app/deckdetails/[deckid]/page.tsx`, `app/events/[eventid]/page.tsx`,
        `app/events/page.tsx`: functions referenced inside `useEffect` before
        their declaration (safe at runtime due to closures/hoisting timing,
        but flagged by `react-hooks/immutability`) — reordered declarations
        above their effects.
      - `app/components/NavBar/NavBar.tsx`, `app/components/ThemeWrapper.tsx`:
        `setState` called directly in an effect (`react-hooks/set-state-in-effect`).
        This is an intentional hydration-safe pattern (cookie value unavailable
        during SSR) — documented with a comment + targeted eslint-disable
        rather than restructured, to avoid a hydration-mismatch regression.
- [x] Fixed an operator-precedence bug in `app/stats/page.tsx`:
      `userStats?.averageplacement ?? 0 > 0` parsed as
      `?? (0 > 0)` (nullish coalescing binds looser than `>`), not the
      intended `(?? 0) > 0`. Corrected with explicit parens.
- [x] Fixed a listener-leak bug in `app/exportdeck/[deckid]/page.tsx`: a
      `useEffect` with no dependency array added a new `focus` event listener
      to the `cardback-url` input on every render, and used an unsafe `!`
      non-null assertion on `getElementById`. Added `[]` deps and a null-safe
      `?.`.
- Noted but not changed (pre-existing, widespread pattern, out of scope for a
  quick pass): many pages fetch data in `useEffect(..., [])` without including
  `userToken`/route params in deps — safe in practice since this app forces
  full page reloads on auth/user changes, but could cause stale data if a
  route param changes via pure client-side navigation. Revisit if that becomes
  an actual symptom.
