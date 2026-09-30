'use client'
import Link from "next/link";
import { useMemo, useState } from "react";
import UserData from "../../util/UserData";
import type { PlayerSummaryEntry } from "../../types";
import { useStatsFetch } from "../_components/useStatsFetch";
import { EmptyRow, ErrorState, LoadingState, SortHeader, type SortState, nextSort, ratio, sortBy } from "../_components/StatsUi";
import { PlayerName } from "../../components/DemoMode";

type SortKey = "name" | "games" | "kills" | "kpg";

function sortValue([, player]: PlayerSummaryEntry, key: SortKey) {
  switch (key) {
    case "name": return player.username;
    case "games": return player.gamesPlayed;
    case "kills": return player.kills;
    case "kpg": return ratio(player.kills, player.gamesPlayed);
  }
}

export default function StatsUsers() {
  const { userToken } = UserData();
  const { data, error, loading } = useStatsFetch<{ usersStats: PlayerSummaryEntry[] }>("stats/users", userToken);
  const [sort, setSort] = useState<SortState<SortKey>>({ key: "games", desc: true });
  const rows = useMemo(() => sortBy(data?.usersStats ?? [], sort, sortValue), [data, sort]);

  if (error) return <ErrorState />;
  if (loading) return <LoadingState />;

  const onSort = (key: SortKey) => setSort(prev => nextSort(prev, key, key !== "name"));
  const header = (label: string, key: SortKey, className = "text-right") => <SortHeader label={label} sortKey={key} sort={sort} onSort={onSort} className={className} />;

  return (
    <section aria-label="Player stats" className="overflow-x-auto rounded-box bg-base-100 shadow-sm">
      <table className="table table-zebra text-base">
        <thead>
          <tr>
            {header("Player", "name", "")}
            {header("Games", "games")}
            {header("Kills", "kills")}
            {header("Kills / game", "kpg")}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={4}>No players yet.</EmptyRow>
            : rows.map(([id, player]) => (
              <tr key={id} className={player.gamesPlayed ? "" : "text-base-content/50"}>
                <td><Link className="font-medium hover:text-primary hover:underline" href={`/stats/users/${id}`}><PlayerName id={id} name={player.username} /></Link></td>
                <td className="text-right font-mono">{player.gamesPlayed}</td>
                <td className="text-right font-mono">{player.kills}</td>
                <td className="text-right font-mono">{player.gamesPlayed ? ratio(player.kills, player.gamesPlayed).toFixed(2) : "—"}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </section>
  );
}