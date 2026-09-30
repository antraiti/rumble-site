# Architecture

Next.js 16 (App Router) + React 19 + Tailwind 4 + daisyUI 5. TypeScript throughout.

## Backend relationship
This app is a **thin BFF/proxy**: almost every `app/api/**/route.tsx` just forwards
requests to an external backend at `process.env.API_URL` (e.g. `/user`, `/deck/v2`,
`/event`), passing through `request.headers` and JSON body, then relays the response.
No local database in this repo.

## Auth
- Login: `POST /api/login` -> external `/login`. Returns `{username, id, token, isadmin}`.
- Client stores that object as JSON in a cookie named `userdata` via `js-cookie`
  (see [app/util/UserData.tsx](../app/util/UserData.tsx)).
- Every authenticated client fetch sends the token as header `x-access-token`.
- `isAdmin` gates admin-only UI/actions (e.g. [app/profile/page.tsx](../app/profile/page.tsx)).
- There is no server-side session validation in this repo; the external API is
  assumed to validate `x-access-token`.

## Realtime
`app/api/ws/route.tsx` uses `next-ws` to implement a raw WebSocket relay:
any connected client's message is forwarded to every *other* open client.
No auth is applied at this layer. Messages are JSON `{ "type": "event-updated", "eventId": n }`;
the event page ignores anything that isn't an update for the event it shows. Client side wraps the app in
`WebSocketProvider` via [app/components/WebhookWrapper.tsx](../app/components/WebhookWrapper.tsx),
connecting to `ws://${HOST_URL}/api/ws`.

## Theming
daisyUI theme name stored in a `theme` cookie, set/read via
[app/components/ThemeWrapper.tsx](../app/components/ThemeWrapper.tsx) and
`ThemeContext`. Applied as `data-theme` on `<body>`.

## Directory map
- `app/api/**` — proxy routes to external API (see [API.md](./API.md))
- `app/<feature>/page.tsx` — route pages, mostly client components (`'use client'`)
  doing `fetch('api/...')` in `useEffect`
- `app/util/UserData.tsx` — cookie-backed "auth hook" used everywhere for
  `userToken`, `userName`, `userId`, `isAdmin`
- `app/util/utils.tsx` — misc shared helpers
- `app/components/` — NavBar, Theme/Webhook wrappers
- `models/tts/tts_deckmodel.ts` — Tabletop Simulator deck export model

## Known issues (see [TODO-REFACTOR.md](./TODO-REFACTOR.md))
- Repeated fetch-boilerplate duplicated in ~every page/route
- Bug: `res.ok` checked *after* `res.json()` already replaced `res` — always
  falsy, so error branch ("this is currently broken...") always runs
- No shared TypeScript types/interfaces for API payloads (`any` everywhere)
- Env vars (`API_URL`, `HOST_URL`) unvalidated
