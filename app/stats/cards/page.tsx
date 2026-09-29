'use client'
import { useMemo, useState } from "react";
import UserData from "../../util/UserData";
import type { CardStat, CardStatEntry } from "../../types";
import { useStatsFetch } from "../_components/useStatsFetch";
import { ArtThumb, CardName, EmptyRow, ErrorState, LoadingState, ManaCost, Pagination, SortHeader, type SortState, nextSort, percent, ratio, sortBy } from "../_components/StatsUi";

type SortKey = "name" | "mv" | "plays" | "wins" | "winrate" | "avg";
const pageSize = 25;

function sortValue(stat: CardStat, key: SortKey) {
  switch (key) {
    case "name": return stat.card.name;
    case "mv": return stat.card.mv;
    case "plays": return stat.count;
    case "wins": return stat.wins;
    case "winrate": return ratio(stat.wins, stat.count);
    case "avg": return ratio(stat.placementtotal, stat.count);
  }
}

export default function StatsCards() {
  const { userToken } = UserData();
  const { data, error, loading } = useStatsFetch<{ cards: CardStatEntry[] }>("stats/cards", userToken);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortState<SortKey>>({ key: "plays", desc: true });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const stats = (data?.cards ?? []).map(([, stat]) => stat).filter(stat => stat.card.name.toLowerCase().includes(term));
    return sortBy(stats, sort, sortValue);
  }, [data, search, sort]);

  if (error) return <ErrorState />;
  if (loading) return <LoadingState rows={8} />;

  const pageCount = Math.ceil(rows.length / pageSize);
  const current = Math.min(page, Math.max(pageCount - 1, 0));
  const onSort = (key: SortKey) => { setSort(prev => nextSort(prev, key, key !== "name" && key !== "avg")); setPage(0); };
  const header = (label: string, key: SortKey, className = "text-right") => <SortHeader label={label} sortKey={key} sort={sort} onSort={onSort} className={className} />;

  return (
    <section aria-label="Card stats" className="space-y-4">
      <label className="input w-full sm:w-80">
        <span className="label">Search</span>
        <input type="search" placeholder="Card name" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
      </label>
      <div className="overflow-x-auto rounded-box bg-base-100 shadow-sm">
        <table className="table table-zebra text-base">
          <thead>
            <tr>
              {header("Card", "name", "")}
              <th className="hidden sm:table-cell">Cost</th>
              <th className="hidden lg:table-cell">Type</th>
              {header("MV", "mv")}
              {header("Plays", "plays")}
              {header("Wins", "wins")}
              {header("Win rate", "winrate")}
              {header("Avg. place", "avg")}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? <EmptyRow colSpan={8}>{search ? `No cards match “${search}”.` : "No card stats yet."}</EmptyRow>
              : rows.slice(current * pageSize, (current + 1) * pageSize).map(stat => (
                <tr key={stat.card.id}>
                  <td><span className="flex items-center gap-3"><ArtThumb src={stat.artcrop} /><CardName id={stat.card.id} name={stat.card.name} /></span></td>
                  <td className="hidden sm:table-cell"><ManaCost cost={stat.card.cost} /></td>
                  <td className="hidden max-w-64 truncate text-base-content/70 lg:table-cell" title={stat.card.typeline}>{stat.card.typeline}</td>
                  <td className="text-right font-mono">{stat.card.mv}</td>
                  <td className="text-right font-mono">{stat.count}</td>
                  <td className="text-right font-mono">{stat.wins}</td>
                  <td className="text-right font-mono">{percent(ratio(stat.wins, stat.count))}</td>
                  <td className="text-right font-mono">{stat.count ? ratio(stat.placementtotal, stat.count).toFixed(2) : "—"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-base-content/70">{rows.length} cards</span>
        <Pagination page={current} pageCount={pageCount} onPage={setPage} />
      </div>
    </section>
  );
}