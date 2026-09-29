import type { ReactNode } from "react";
import type { ColorPlayCounts, ColorWinRates } from "../../types";

export const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
export const ratio = (part: number, total: number) => (total > 0 ? part / total : 0);

export function formatDuration(seconds: number) {
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

export function StatTiles({ items }: { items: { label: string; value: ReactNode; hint?: string }[] }) {
  return (
    <div className="stats stats-vertical w-full bg-base-100 shadow-sm sm:stats-horizontal">
      {items.map(item => (
        <div key={item.label} className="stat">
          <div className="stat-title text-base">{item.label}</div>
          <div className="stat-value">{item.value}</div>
          {item.hint && <div className="stat-desc text-sm">{item.hint}</div>}
        </div>
      ))}
    </div>
  );
}

const colors: { key: keyof ColorPlayCounts; name: string; icon: string; accent: string; ring: string }[] = [
  { key: "w", name: "White", icon: "/W.svg", accent: "bg-amber-100", ring: "text-amber-300" },
  { key: "u", name: "Blue", icon: "/U.svg", accent: "bg-sky-200", ring: "text-sky-400" },
  { key: "b", name: "Black", icon: "/B.svg", accent: "bg-gray-300", ring: "text-gray-400" },
  { key: "r", name: "Red", icon: "/R.svg", accent: "bg-red-300", ring: "text-red-400" },
  { key: "g", name: "Green", icon: "/G.svg", accent: "bg-green-300", ring: "text-green-400" },
  { key: "c", name: "Colorless", icon: "/C.svg", accent: "bg-base-content/30", ring: "text-base-content/60" },
];

// Minimum games before a color can be "best", so 1-for-1 colors don't win outright.
const BEST_COLOR_MIN_GAMES = 5;

function bestColors(plays: ColorPlayCounts, winrates: ColorWinRates) {
  const played = colors.filter(color => plays[color.key] > 0);
  const eligible = played.filter(color => plays[color.key] >= BEST_COLOR_MIN_GAMES);
  const pool = eligible.length ? eligible : played;
  const top = Math.max(0, ...pool.map(color => winrates[color.key]));
  return new Set(top > 0 ? pool.filter(color => Math.abs(winrates[color.key] - top) < 1e-9).map(color => color.key) : []);
}

export function ColorTable({ plays, winrates }: { plays: ColorPlayCounts; winrates: ColorWinRates }) {
  const best = bestColors(plays, winrates);
  return (
    <section aria-label="Colors" className="@container">
      <ul className="grid grid-cols-2 gap-4 @md:grid-cols-3 @3xl:grid-cols-6">
        {colors.map(color => {
          const rate = winrates[color.key] * 100;
          const tile = (
            <div className="relative h-full min-w-0 overflow-hidden rounded-box bg-base-100 p-3 pt-4 text-base-content shadow-sm">
              <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${color.accent}`} />
              <div className="flex items-start justify-between gap-2">
                <img src={color.icon} alt="" className="size-8 shrink-0" />
                <div
                  role="progressbar"
                  aria-label={`${color.name} win rate`}
                  aria-valuenow={Math.round(rate)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  title={`Win rate ${percent(winrates[color.key])}`}
                  className={`radial-progress shrink-0 text-xs font-bold ${color.ring}`}
                  style={{ "--value": rate, "--size": "2.75rem", "--thickness": "4px" } as React.CSSProperties}
                >
                  <span className="text-base-content">{Math.round(rate)}%</span>
                </div>
              </div>
              <div className="mt-2 text-3xl font-black leading-none">{plays[color.key]}</div>
              <div className="truncate text-sm text-base-content/70">{color.name} games</div>
              {best.has(color.key) && <span className="sr-only">Best win rate</span>}
            </div>
          );
          return (
            <li key={color.key} className="min-w-0">
              {best.has(color.key)
                ? <div className={`aura block h-full w-full [--aura-radius:var(--radius-box)] ${color.ring}`}>{tile}</div>
                : tile}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function ArtThumb({ src }: { src?: string }) {
  return src
    ? <img src={src} alt="" loading="lazy" className="h-10 w-14 shrink-0 rounded object-cover" />
    : <span aria-hidden="true" className="block h-10 w-14 shrink-0 rounded bg-base-300" />;
}

export function ManaCost({ cost }: { cost?: string }) {
  const symbols = cost?.match(/\{([^}]+)\}/g)?.map(symbol => symbol.slice(1, -1)) ?? [];
  if (symbols.length === 0) return null;
  return (
    <span className="flex items-center gap-0.5" aria-label={`Mana cost ${cost}`}>
      {symbols.map((symbol, index) => (
        <img key={`${symbol}-${index}`} src={`https://svgs.scryfall.io/card-symbols/${symbol.replaceAll("/", "")}.svg`} alt="" loading="lazy" className="size-5" />
      ))}
    </span>
  );
}

export type SortState<K extends string> = { key: K; desc: boolean };

export function SortHeader<K extends string>({ label, sortKey, sort, onSort, className = "" }: {
  label: string; sortKey: K; sort: SortState<K>; onSort: (key: K) => void; className?: string;
}) {
  const active = sort.key === sortKey;
  return (
    <th aria-sort={active ? (sort.desc ? "descending" : "ascending") : "none"} className={className}>
      <button type="button" className="inline-flex items-center gap-1 hover:text-primary" onClick={() => onSort(sortKey)}>
        {label}
        <span aria-hidden="true" className={active ? "" : "opacity-30"}>{active && !sort.desc ? "▲" : "▼"}</span>
      </button>
    </th>
  );
}

export function nextSort<K extends string>(current: SortState<K>, key: K, firstDesc = true): SortState<K> {
  return current.key === key ? { key, desc: !current.desc } : { key, desc: firstDesc };
}

export function sortBy<T, K extends string>(rows: T[], sort: SortState<K>, value: (row: T, key: K) => number | string) {
  return [...rows].sort((a, b) => {
    const x = value(a, sort.key);
    const y = value(b, sort.key);
    const cmp = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
    return sort.desc ? -cmp : cmp;
  });
}

export const isScryfallId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export function CardName({ id, name }: { id: string; name: string }) {
  return isScryfallId(id)
    ? <a className="hover:text-primary hover:underline" href={`https://scryfall.com/search?q=oracleid=${id}`} target="_blank" rel="noreferrer">{name}</a>
    : <span>{name}</span>;
}

export function LoadingState({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <div className="skeleton h-24 w-full" />
      {Array.from({ length: rows }, (_, index) => <div key={index} className="skeleton h-8 w-full" />)}
    </div>
  );
}

export function ErrorState() {
  return <div role="alert" className="alert alert-error">Couldn&apos;t load stats. Try refreshing the page.</div>;
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return <tr><td colSpan={colSpan} className="py-8 text-center text-base-content/60">{children}</td></tr>;
}

export function Pagination({ page, pageCount, onPage }: { page: number; pageCount: number; onPage: (page: number) => void }) {
  return (
    <div className="join">
      <button type="button" className="join-item btn" disabled={page === 0} onClick={() => onPage(0)}>First</button>
      <button type="button" className="join-item btn" disabled={page === 0} onClick={() => onPage(page - 1)}>Prev</button>
      <span className="join-item btn btn-disabled no-animation">Page {page + 1} of {Math.max(pageCount, 1)}</span>
      <button type="button" className="join-item btn" disabled={page >= pageCount - 1} onClick={() => onPage(page + 1)}>Next</button>
      <button type="button" className="join-item btn" disabled={page >= pageCount - 1} onClick={() => onPage(pageCount - 1)}>Last</button>
    </div>
  );
}
