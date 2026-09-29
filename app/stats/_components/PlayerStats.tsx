'use client'
import { useState } from "react";
import UserData from "../../util/UserData";
import type { PlayerCommanderStats, UserStats } from "../../types";
import { useStatsOptions } from "./StatsShell";
import { useStatsFetch } from "./useStatsFetch";
import Matchups from "./Matchups";
import { ArtThumb, CardName, ColorTable, EmptyRow, ErrorState, LoadingState, StatTiles, percent, ratio } from "./StatsUi";

export default function PlayerStats({ userId, fallbackName, isSelf }: { userId: string | number | null; fallbackName?: string; isSelf: boolean }) {
  const { userToken } = UserData();
  const { includeThemed } = useStatsOptions();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const params = new URLSearchParams({ themed: String(includeThemed) });
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  // Win data is private: only a player's own view requests it.
  const summary = useStatsFetch<UserStats>(isSelf && userId ? `stats/user/${userId}?themed=${includeThemed}` : null, userToken);
  const commanders = useStatsFetch<PlayerCommanderStats>(userId ? `stats/users/${userId}?${params}` : null, userToken);

  const primary = isSelf ? summary : commanders;
  if (primary.error) return <ErrorState />;
  if (primary.loading) return <LoadingState />;

  const stats = isSelf ? summary.data : undefined;
  const name = commanders.data?.user?.username ?? fallbackName;
  const list = Array.isArray(commanders.data?.commanders) ? commanders.data.commanders : [];
  const columns = isSelf ? 5 : 3;

  return (
    <div className="space-y-6">
      {name && <h2 className="text-3xl font-bold">{name}</h2>}
      {stats && <StatTiles items={[
        { label: "Games played", value: stats.matchesplayed },
        { label: "Wins", value: stats.matcheswon },
        { label: "Win rate", value: percent(ratio(stats.matcheswon, stats.matchesplayed)) },
        { label: "Avg. placement", value: stats.matchesplayed ? stats.averageplacement.toFixed(2) : "—" },
      ]} />}
      {stats && <ColorTable plays={stats.colorplaycount} winrates={stats.colorwinrates} />}
      {userId && <Matchups userId={userId} name={name} isSelf={isSelf} overallWinRate={stats ? ratio(stats.matcheswon, stats.matchesplayed) : undefined} />}
      <section aria-labelledby="commanders-heading" className="card bg-base-100 shadow-sm">
          <div className="card-body gap-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="commanders-heading" className="card-title text-xl">Commanders</h2>
              <div className="join">
                <label className="input join-item">
                  <span className="label">From</span>
                  <input type="date" value={from} max={to || undefined} onChange={e => setFrom(e.target.value)} />
                </label>
                <label className="input join-item">
                  <span className="label">To</span>
                  <input type="date" value={to} min={from || undefined} onChange={e => setTo(e.target.value)} />
                </label>
                {(from || to) && <button type="button" className="btn join-item" onClick={() => { setFrom(""); setTo(""); }}>Clear</button>}
              </div>
            </div>
            {commanders.error ? <ErrorState /> : (
              <div className="overflow-x-auto">
                <table className="table table-zebra text-base">
                  <thead>
                    <tr>
                      <th>Commander</th>
                      <th className="text-right">Games</th>
                      {isSelf && <th className="text-right">Wins</th>}
                      {isSelf && <th className="text-right">Win rate</th>}
                      <th className="hidden text-right sm:table-cell">Last played</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commanders.loading ? <EmptyRow colSpan={columns}><span className="loading loading-dots" aria-label="Loading" /></EmptyRow>
                      : list.length === 0 ? <EmptyRow colSpan={columns}>No commanders played in this range.</EmptyRow>
                      : list.map(commander => (
                        <tr key={commander.cardid}>
                          <td><span className="flex items-center gap-3"><ArtThumb src={commander.artcrop} /><CardName id={commander.cardid} name={commander.name} /></span></td>
                          <td className="text-right font-mono">{commander.games}</td>
                          {isSelf && <td className="text-right font-mono">{commander.wins ?? 0}</td>}
                          {isSelf && <td className="text-right font-mono">{percent(ratio(commander.wins ?? 0, commander.games))}</td>}
                          <td className="hidden text-right text-base-content/70 sm:table-cell">{commander.lastplayed ? new Date(commander.lastplayed).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
    </div>
  );
}
