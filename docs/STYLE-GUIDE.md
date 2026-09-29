# UI Style Guide

Derived from existing patterns in `app/decks/page.tsx` / `DeckCard.tsx` and
`app/events/[eventid]/page.tsx` / `MatchCard.tsx` — the two most representative
"list + detail card" pages. Follow these for new pages/components rather than
inventing new patterns.

## Layout containers
- Page root: `max-w-6xl w-full` (stats pages) or `max-w-7xl mx-auto` (decks/match
  cards) centered with `mx-auto`.
- Card container: `bg-base-100 shadow-xl rounded-xl` (or `card` daisyUI class),
  spaced with `m-3` / `m-5`.
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
Consistent color-to-class mapping: red→`bg-red-300`/`R.svg`, blue→`bg-sky-200`/`U.svg`
(sometimes `sky-400` for checkboxes), white→`bg-amber-100`/`W.svg`, green→`bg-green-300`/`G.svg`,
black→`bg-gray-300`/`B.svg`, colorless→`C.svg`. Reuse these exact class/svg pairs
anywhere color identity is displayed — don't invent new colors per page.

## Stats display
Use daisyUI `stats`/`stat`/`stat-title`/`stat-value` for any "label + big number"
metric, matching `DeckCard.tsx`'s Games Played / Winrate / Avg. Placement block.

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
