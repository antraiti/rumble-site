# API Routes (`app/api/**/route.tsx`)

All routes proxy to `process.env.API_URL` unless noted. Auth via forwarded
`x-access-token` header (set by caller from `userToken`).

During the Python-to-Go API migration, `RumbleSite` accepts both legacy and new
response shapes at compatibility boundaries. In particular, event `decks` may
be legacy `[deck, commanderCard]` tuples or new plain deck objects; use
`app/util/deckCompatibility.ts` rather than branching in individual components.

| Route | Method | External endpoint | Notes |
|---|---|---|---|
| `/api/login` | POST | `/login` | No token required |
| `/api/user` | POST | `/user` | Create user (admin) |
| `/api/user/[username]/pass` | PUT | `/user/:username/pass` | Change password |
| `/api/users` | GET | `/user` | List users |
| `/api/decks` | GET | `/userdeckswithcards` | |
| `/api/deck` | POST | `/deck/v2` | |
| `/api/deck/[deckid]` | GET/etc | | |
| `/api/deck/[deckid]/steal` | POST | | |
| `/api/deck/checker` | GET | | Deck legality checker |
| `/api/deck/remove/[deckid]` | DELETE | | |
| `/api/decks` | GET | | |
| `/api/events` | GET/POST | `/event` | List / create events |
| `/api/events/details/[eventid]` | GET | | |
| `/api/match` | GET/POST | | |
| `/api/themes` | GET | | |
| `/api/colors` | GET | | Color identity lookup |
| `/api/cards/banlist` | GET | | |
| `/api/cards/fromdecklist` | POST | | Parse decklist text |
| `/api/cards/printfavorite` | POST | | |
| `/api/cards/watchlist` | GET/POST | | |
| `/api/stats/global` | GET | `?themed=` query | |
| `/api/stats/user/[userid]` | GET | `?themed=` query | |
| `/api/stats/users` | GET | | |
| `/api/stats/cards` | GET/`custom` | | |
| `/api/stats/watchlist` | GET | | |
| `/api/performance` | GET | | |
| `/api/admin/bulktokens` | POST | `/bulktokens` | Admin-only local bulk processing (legacy route) |
| `/api/admin/bulkprocess/dry-run` | POST | `/bulkprocess/dry-run` | Admin-only preview of local bulk file; no database writes |
| `/api/admin/bulkupdate` | POST | `/bulkupdate` | Admin-only download from Scryfall and database update |
| `/api/ws` | GET (dummy) + `SOCKET` | n/a | Raw WS broadcast relay, no auth |

## Standard proxy pattern (current, duplicated per-route)
```ts
export async function GET(request: Request) {
  const res = await fetch(process.env.API_URL + '/thing', {
    method: 'GET',
    headers: request.headers
  }).then(data => {
    if (data.status >= 400) throw new Error("Server responds with error!");
    if (data.status === 204) return [];
    return data.json();
  })
  if (res.ok) return Response.json(await res.json()); // BUG: res is already JSON here
  else return Response.json(res);
}
```
This `res.ok` check is broken in most GET/POST proxy routes (see TODO-REFACTOR).
Planned replacement: a single `proxyFetch(path, request, init?)` helper in
`app/util/apiProxy.ts` that all routes call.
