# UI Style Guide

Derived from existing patterns in `app/decks/page.tsx` / `DeckCard.tsx` and
`app/events/[eventid]/page.tsx` / `MatchCard.tsx` — the two most representative
"list + detail card" pages. Follow these for new pages/components rather than
inventing new patterns.

## Layout containers
- Page root: `mx-auto w-full max-w-6xl px-5 py-8 sm:px-8` (stats, events) or
  `max-w-7xl mx-auto` (decks/match cards). Never rely on fixed pixel widths.
- Page header (reference: `app/stats/_components/StatsShell.tsx`, `app/events/page.tsx`):
  small uppercase eyebrow (`text-sm font-bold uppercase text-primary`, e.g.
  "Rumble / Stats"), `h1` `text-3xl font-bold`, bottom rule
  `border-b border-base-content/15 pb-5`. Page-level controls (toggles) sit on the
  right of the header.
- Multi-view sections use daisyUI `tabs tabs-border tabs-lg` built from `Link`s
  (`role="tab"`, `aria-selected`) in a shared layout, not an icon side menu.
  Shared page options (e.g. "Include themed events") live in that layout via context.
- Card container: `card bg-base-100 shadow-sm` (use `shadow-xl` only for hero/list
  cards). Don't wrap content in a card when it already reads as a group (e.g. the
  color tiles sit directly on the page).
- Prefer daisyUI's `card`, `card-side`, `stats`, `stat` components over custom
  flex layouts when the content fits (title + value pairs -> `stats`/`stat`).

## Card pattern (list item)
`DeckCard.tsx` / `MatchCard.tsx` establish the shape for a clickable list-item
card:
```tsx
<div className="card cursor-pointer card-side bg-base-100 shadow-xl m-3 h-40 max-w-7xl mx-auto hover:shadow-base-300" onClick={...}>
  <figure className="w-1/4"><img src={imageUrl} /></figure>
  {/* side strip, body, stats */}
</div>
```
- Whole-card click navigates via `useRouter().push(...)`; don't nest an `<a>`
  around the entire card.
- Image fallback: always guard missing card art with a fallback URL constant
  (see `getCommanderImageUrl()` in both files) rather than letting `<img>`
  render broken.

## Color identity strip
Recurring 5-color pip strip pattern (used in `DeckCard.tsx` and filter bars in
`decks/page.tsx`):
```tsx
{colorInfo?.red && <div className="flex flex-1 bg-red-300"><img className="flex-1" src="R.svg"/></div>}
{colorInfo?.blue && <div className="flex flex-1 bg-sky-200"><img className="flex-1" src="U.svg"/></div>}
{colorInfo?.white && <div className="flex flex-1 bg-amber-100"><img className="flex-1" src="W.svg"/></div>}
{colorInfo?.green && <div className="flex flex-1 bg-green-300"><img className="flex-1" src="G.svg"/></div>}
{colorInfo?.black && <div className="flex flex-1 bg-gray-300"><img className="flex-1" src="B.svg"/></div>}
```
Consistent color-to-class mapping. Reuse these exact pairs anywhere color identity
is displayed — don't invent new colors per page:

| Color | Icon | Fill / strip | Ring, glow, emphasis text |
|---|---|---|---|
| White | `W.svg` | `bg-amber-100` | `text-amber-300` |
| Blue | `U.svg` | `bg-sky-200` | `text-sky-400` |
| Black | `B.svg` | `bg-gray-300` | `text-gray-400` |
| Red | `R.svg` | `bg-red-300` | `text-red-400` |
| Green | `G.svg` | `bg-green-300` | `text-green-400` |
| Colorless | `C.svg` | `bg-base-content/30` | `text-base-content/60` |

Use the fill column for backgrounds/strips and the ring column for anything drawn
in `currentColor` (radial progress, `aura`, icons). Checkbox filters may keep
`sky-400` for contrast.

## Color stat tiles (reference: `ColorTable` in `app/stats/_components/StatsUi.tsx`)
The preferred way to show per-color numbers. One compact, bold tile per color:
```tsx
<li className="relative overflow-hidden rounded-box bg-base-100 p-3 pt-4 shadow-sm">
  <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-green-300" />  {/* fill color strip */}
  <div className="flex items-start justify-between">
    <img src="/G.svg" alt="" className="size-8" />
    <div role="progressbar" className="radial-progress text-green-400 text-xs font-bold"
         style={{ "--value": 35, "--size": "2.75rem", "--thickness": "4px" }}>35%</div>
  </div>
  <div className="mt-2 text-3xl font-black leading-none">148</div>
  <div className="text-sm text-base-content/70">Green games</div>
</li>
```
- Big number = the primary metric (`text-3xl font-black leading-none`); secondary
  metric as a small `radial-progress` in the ring color; one short caption.
- Lay out in one row of six on wide screens using container queries so the tiles
  adapt to wherever they're placed: `@container` on the wrapper, grid
  `grid-cols-2 @md:grid-cols-3 @3xl:grid-cols-6`. No section heading or card
  wrapper needed — give the `<section>` an `aria-label` instead.
- The same tile anatomy (accent strip + icon + big number + caption) works for
  other small categorical breakdowns.

## Highlighting a "best" item
Use daisyUI `aura` around the winning tile, colored with the item's ring color
(`currentColor`): `<div className="aura block h-full w-full [--aura-radius:var(--radius-box)] text-green-400">`.
- Reset text color inside (`text-base-content` on the tile) so only the glow is tinted.
- Add `sr-only` text (e.g. "Best win rate") — the glow is visual only.
- Require a minimum sample (stats use 5 games) so tiny samples don't win; ties all glow.
- Use sparingly: at most one highlighted group per view.

## Stats display
Use daisyUI `stats`/`stat`/`stat-title`/`stat-value` for any "label + big number"
summary row (`StatTiles` in `StatsUi.tsx`): `stats stats-vertical sm:stats-horizontal
w-full bg-base-100 shadow-sm`, `stat-title text-base`, default `stat-value` size.
Per-color breakdowns use color stat tiles (above), not repeated `stat` blocks.

## Badges
Use `badge badge-outline` for short metadata tags (commander name, partner name,
match power level) — not custom pill divs.

## Tables (editable grids)
`MatchCard.tsx`'s performance table is the reference for any editable tabular
data: daisyUI `table`, per-cell `<select className="select select-ghost ...">`
bound to `value={x ?? undefined}` with a shared `onChange` handler that reads
`e.target.name`/`e.target.value` and dispatches by field name. Follow this
"one generic update handler keyed by input name" pattern instead of one handler
per field.

## Dropdown menus / popovers
Use daisyUI's native `<div className="dropdown">` + `tabIndex={0} role="button"`
trigger + `dropdown-content menu` list, as seen for the "Power" and "add player"
menus in `MatchCard.tsx`. Don't build custom show/hide state for simple menus.

## Modals
Use `<dialog className="modal">` + `<div className="modal-box">` (see the
"New Event" dialog in `events/page.tsx`), opened via
`document.getElementById(id).showModal()` — consistent with existing admin/create
flows despite the `getElementById` usage (acceptable for imperative dialog
open/close only, not for reading form values — see CONVENTIONS.md).

## Realtime refresh pattern
After any mutating action (`updateMatch`, `requestNewMatch`, etc.), the
established pattern is: call the mutation, then `ws?.send("buh")` to notify
other clients, then locally re-fetch (`updateEventDetails()`). Any new
multiplayer-editable feature should follow this same
"mutate -> broadcast -> refetch" sequence rather than optimistic local state
updates.

## Buttons
- Primary actions: `btn btn-outline btn-success` / `btn-warning` / `btn-error`
  / `btn-info` depending on semantic meaning (start=success, end=warning,
  delete=error, informational/join=info). Keep this color-to-intent mapping
  consistent across new features.

## Readability and sizing
- Favor clarity over density: default daisyUI sizes for `table`, `input`, `btn`,
  `toggle`; add `text-base` to data tables. Avoid `-sm`/`-xs` variants and
  `text-xs` for primary content (fine for tiny captions inside tiles).
- Numbers in tables: right-aligned `font-mono`. Show `—` when a value can't be
  computed (e.g. win rate with 0 games), never `NaN`/`N/A`.

## Read-only data tables (reference: `app/stats/cards/page.tsx`)
- `overflow-x-auto rounded-box bg-base-100 shadow-sm` wrapper + `table table-zebra text-base`.
- Sortable columns use `SortHeader`: a `<button>` inside `<th>` with `aria-sort`
  and a ▲/▼ indicator. Text columns sort ascending first; counts sort descending
  first; "lower is better" columns (avg. placement) sort ascending first.
- Card rows: `ArtThumb` (art crop, `h-10 w-14 rounded object-cover`, grey
  placeholder when missing) + name. Link to Scryfall only for real Scryfall IDs
  (custom cards use their name as ID).
- Secondary columns hide on small screens (`hidden sm:table-cell` / `lg:table-cell`).
- Paging: `join` of First / Prev / "Page x of y" / Next / Last with disabled ends.

## Mana symbols
Render costs with Scryfall SVGs: `https://svgs.scryfall.io/card-symbols/{symbol}.svg`
where `{symbol}` is the brace contents with `/` removed (`{W/U}` → `WU`, `{2/W}`
→ `2W`, `{G/P}` → `GP`). See `ManaCost` in `StatsUi.tsx`.

## Loading, empty, and error states
Every data view handles all three: `skeleton` blocks while loading, an empty row/
message (`text-base-content/60`, centered) when there's no data, and
`alert alert-error` on failure. Don't render `undefined`/blank values.

## Privacy
Never show another player's wins, win rate, placements, or color win rates. See
`CONVENTIONS.md` → "Stats privacy". Shared components take an explicit
`isSelf` flag to decide what to render.

## Prototyping in the sandbox
Build and review new components in `/sandbox` (git-ignored, unlinked) with static
sample data before porting to real pages. It's scanned by Tailwind via
`@source "./sandbox"` in `globals.css` — keep that line or sandbox-only classes
won't be generated.
