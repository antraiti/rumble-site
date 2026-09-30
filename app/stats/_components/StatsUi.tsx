import Link from "next/link";
import type { ReactNode } from "react";
import type { ColorPlayCounts, ColorWinRates, SeatStat } from "../../types";
import { PlayerName } from "../../components/DemoMode";
import SteadyAura from "../../components/SteadyAura";

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
                ? <SteadyAura className={`block h-full w-full [--aura-radius:var(--radius-box)] ${color.ring}`}>{tile}</SteadyAura>
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
  return <Link className="hover:text-primary hover:underline" href={`/stats/cards/${encodeURIComponent(id)}`}>{name}</Link>;
}

export function Panel({ title, description, action, className = "", children }: {
  title: ReactNode; description?: ReactNode; action?: ReactNode; className?: string; children: ReactNode;
}) {
  return (
    <section className={`card bg-base-100 shadow-sm ${className}`}>
      <div className="card-body gap-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="card-title text-xl">{title}</h2>
            {description && <p className="text-base-content/70">{description}</p>}
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}

/** Stacked columns: the faded bar is the total, the solid part is the highlighted subset. */
export function ActivityChart({ data, totalLabel, highlightLabel }: {
  data: { label: string; total: number; highlight: number }[]; totalLabel: string; highlightLabel: string;
}) {
  const peak = Math.max(1, ...data.map(item => item.total));
  const ticks = data.length > 1 ? [data[0], data[Math.floor((data.length - 1) / 2)], data[data.length - 1]] : data;
  return (
    <div>
      <div className="flex h-44 items-end gap-1" role="img" aria-label={`${totalLabel} over time`}>
        {data.map(item => (
          <div key={item.label} className="tooltip flex h-full min-w-0 flex-1 items-end" data-tip={`${item.label}: ${item.total} ${totalLabel.toLowerCase()}, ${item.highlight} ${highlightLabel.toLowerCase()}`}>
            <div
              className="flex w-full flex-col justify-end overflow-hidden rounded-t bg-info/25 transition-colors hover:bg-info/40"
              style={{ height: item.total ? `${(item.total / peak) * 100}%` : "2px" }}
            >
              <div className="w-full bg-info" style={{ height: item.total ? `${(item.highlight / item.total) * 100}%` : 0 }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-sm text-base-content/60">
        {ticks.map((tick, index) => <span key={`${tick.label}-${index}`}>{tick.label}</span>)}
      </div>
      <div className="mt-2 flex gap-4 text-sm text-base-content/70">
        <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-info/25" />{totalLabel}</span>
        <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-info" />{highlightLabel}</span>
      </div>
    </div>
  );
}

const ordinal = (n: number) => `${n}${n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th"}`;

/** Win rate per turn-order seat, with a marker for the overall rate. */
export function SeatChart({ seats }: { seats: SeatStat[] }) {
  const rows = seats.filter(seat => seat.games > 0);
  if (rows.length === 0) return <p className="text-base-content/60">No turn order recorded yet.</p>;
  const overall = ratio(rows.reduce((sum, seat) => sum + seat.wins, 0), rows.reduce((sum, seat) => sum + seat.games, 0));
  const scale = Math.max(overall * 1.5, ...rows.map(seat => ratio(seat.wins, seat.games)), 0.01);
  const best = Math.max(...rows.map(seat => ratio(seat.wins, seat.games)));
  return (
    <div className="space-y-3">
      {rows.map(seat => {
        const rate = ratio(seat.wins, seat.games);
        return (
          <div key={seat.seat} className="grid grid-cols-[3rem_1fr_auto] items-center gap-3">
            <span className="font-bold">{ordinal(seat.seat)}</span>
            <div className="relative h-8 overflow-hidden rounded-field bg-base-200">
              <div
                className={`flex h-full items-center justify-end rounded-field px-2 text-sm font-bold ${rate === best && rate > 0 ? "bg-linear-to-r from-info to-accent text-info-content" : "bg-info/35"}`}
                style={{ width: `${Math.max((rate / scale) * 100, 12)}%` }}
              >
                {percent(rate)}
              </div>
              <span aria-hidden="true" className="absolute inset-y-0 border-l-2 border-dashed border-base-content/50" style={{ left: `${(overall / scale) * 100}%` }} />
            </div>
            <span className="text-right text-sm text-base-content/70">{seat.games} games</span>
          </div>
        );
      })}
      <p className="flex items-center gap-2 text-sm text-base-content/60">
        <span aria-hidden="true" className="h-4 border-l-2 border-dashed border-base-content/50" />Overall {percent(overall)}
      </p>
    </div>
  );
}

export function IdentityPips({ identity }: { identity: { white: boolean; blue: boolean; black: boolean; red: boolean; green: boolean } }) {
  const pips = ([["white", "W"], ["blue", "U"], ["black", "B"], ["red", "R"], ["green", "G"]] as const).filter(([key]) => identity[key]);
  return (
    <span className="flex shrink-0 items-center gap-0.5">
      {(pips.length ? pips.map(([, symbol]) => symbol) : ["C"]).map(symbol => <img key={symbol} src={`/${symbol}.svg`} alt="" className="size-5" />)}
    </span>
  );
}

export function PlayerLink({ id, name, className = "font-semibold" }: { id: number; name: string; className?: string }) {
  return <Link href={`/stats/users/${id}`} className={`hover:text-primary hover:underline ${className}`}><PlayerName id={id} name={name} /></Link>;
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
