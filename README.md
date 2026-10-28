This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

This project is part of the parent Rumble workspace. Read the top-level [workspace README](../README.md) and [architecture specification](../ARCHITECTURE.md) before making changes that may affect `RumbleAPI` or shared API contracts.

## Getting Started

Use Node.js **24.22.1 LTS** (also pinned in `.node-version`), then run `npm ci`.
After changing Node versions, reinstall dependencies so native packages match.
The Node runtime on the deployment host must be upgraded separately; updating
`package-lock.json` does not update the host's Node executable.
The `prepare` lifecycle script runs `next-ws patch --yes` after installs so WebSocket
routes work with the installed Next.js version. Do not skip lifecycle scripts
unless you run `npm run prepare` separately before building or starting the site.
The flag makes installs noninteractive: next-ws 2.2.19 lists support through
Next.js 16.4.2, so the patched relay must be smoke-tested after Next.js upgrades.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Custom card administration

To add custom cards to a deck, open its deck settings and use **Custom cards**.
Search by any part of the name (case-insensitive), then choose **Add** beside a
result. The alphabetized list scrolls independently and keeps your search while
you add multiple cards. Cards already in the deck and back faces are excluded.
Custom card additions and removals are locked once the deck has been played.

Sign in as an administrator and open **Profile > Manage custom cards**
(`/admin/customcards`). Search the catalogue to edit an existing custom card,
or choose **New custom card**. Supports card rules, mana cost/value, printed
power/toughness, combined color identity, banned/watchlist flags, and optional
direct HTTP(S) URLs for card art and art crops. Double-faced cards have separate
rules and artwork for each face.

Saves retain existing card and printing IDs. When a card has multiple printings,
the editor updates the first printing ordered by ID and leaves the others intact.
Existing double-faced cards cannot lose their back face. Official cards cannot
be edited through this tool. The Go API enforces admin access on every request;
this feature requires the updated Go backend, not the legacy Python API.
After changing rules, color identity, or ban flags, use **Profile > Recheck all
decks** to refresh stored legality badges.

`npm audit` checks dependency advisories. Typography currently requires a scoped
`postcss-selector-parser` 7.x override because its latest release still requests
the vulnerable 6.0.10 release; retain this override until upstream upgrades it.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
