'use client'
import { useMemo, useState } from "react";
import UserData from "../../util/UserData";
import type { WatchlistStat } from "../../types";
import { useStatsFetch } from "../_components/useStatsFetch";
import { ArtThumb, CardName, EmptyRow, ErrorState, LoadingState, ManaCost, SortHeader, type SortState, nextSort, percent, ratio, sortBy } from "../_components/StatsUi";

type SortKey = "name" | "plays" | "wins" | "winrate" | "avg";

function sortValue(stat: WatchlistStat, key: SortKey) {
  switch (key) {
    case "name": return stat.name;
    case "plays": return stat.playcount;
    case "wins": return stat.wincount;
    case "winrate": return ratio(stat.wincount, stat.playcount);
    case "avg": return stat.playcount ? stat.average : 99;
  }
}

export default function StatsWatchlist() {
  const { userToken } = UserData();
  const { data, error, loading } = useStatsFetch<{ data: WatchlistStat[] }>("stats/watchlist", userToken);
  const [sort, setSort] = useState<SortState<SortKey>>({ key: "plays", desc: true });
  const rows = useMemo(() => sortBy(data?.data ?? [], sort, sortValue), [data, sort]);

  if (error) return <ErrorState />;
  if (loading) return <LoadingState />;

  const onSort = (key: SortKey) => setSort(prev => nextSort(prev, key, key !== "name" && key !== "avg"));
  const header = (label: string, key: SortKey, className = "text-right") => <SortHeader label={label} sortKey={key} sort={sort} onSort={onSort} className={className} />;

  return (
    <section aria-label="Watchlist stats" className="overflow-x-auto rounded-box bg-base-100 shadow-sm">
      <table className="table table-zebra text-base">
        <thead>
          <tr>
            {header("Card", "name", "")}
            <th className="hidden sm:table-cell">Cost</th>
            {header("Plays", "plays")}
            {header("Wins", "wins")}
            {header("Win rate", "winrate")}
            {header("Avg. place", "avg")}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={6}>No cards are on the watchlist.</EmptyRow>
            : rows.map(stat => (
              <tr key={stat.id}>
                <td><span className="flex items-center gap-3"><ArtThumb src={stat.artcrop} /><CardName id={stat.id} name={stat.name} /></span></td>
                <td className="hidden sm:table-cell"><ManaCost cost={stat.cost} /></td>
                <td className="text-right font-mono">{stat.playcount}</td>
                <td className="text-right font-mono">{stat.wincount}</td>
                <td className="text-right font-mono">{percent(ratio(stat.wincount, stat.playcount))}</td>
                <td className="text-right font-mono">{stat.playcount ? stat.average.toFixed(2) : "—"}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </section>
  );
}