'use client'
import UserData from "../../util/UserData";
import type { GlobalExtraStats, GlobalStats, IdentityPeriodStat } from "../../types";
import { useStatsOptions } from "../_components/StatsShell";
import { useStatsFetch } from "../_components/useStatsFetch";
import { ColorTable, ErrorState, IdentityPips, LoadingState, Panel, SeatChart, StatTiles, formatDuration, percent, ratio } from "../_components/StatsUi";

export default function StatsGlobal() {
  const { userToken } = UserData();
  const { includeThemed } = useStatsOptions();
  const { data, error, loading } = useStatsFetch<GlobalStats>(`stats/global?themed=${includeThemed}`, userToken);
  const extra = useStatsFetch<GlobalExtraStats>(`stats/global/extra?themed=${includeThemed}`, userToken);

  if (error) return <ErrorState />;
  if (loading || !data) return <LoadingState />;

  return (
    <div className="space-y-6">
      <StatTiles items={[
        { label: "Matches played", value: data.matchesplayed },
        { label: "Avg. match length", value: formatDuration(data.averagematchtime) },
        { label: "Avg. players per match", value: data.averagematchsize.toFixed(2) },
      ]} />
      <ColorTable plays={data.colorplaycount} winrates={data.colorwinrates} />
      {extra.error ? <ErrorState /> : extra.loading || !extra.data ? <div className="skeleton h-64 w-full" /> : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Does going first matter?" description="Win rate by seat in turn order.">
              <SeatChart seats={extra.data.seats} />
            </Panel>
            <WinconPanel wincons={extra.data.wincons} />
          </div>
          <IdentityTrends rows={extra.data.identities} />
        </>
      )}
    </div>
  );
}

function WinconPanel({ wincons }: { wincons: GlobalExtraStats["wincons"] }) {
  const total = wincons.reduce((sum, wincon) => sum + wincon.games, 0);
  const top = Math.max(1, ...wincons.map(wincon => wincon.games));
  return (
    <Panel title="How games end" description="Win conditions across recorded matches.">
      {wincons.length === 0 ? <p className="text-base-content/60">No win conditions recorded yet.</p> : (
        <ul className="space-y-3">
          {wincons.map((wincon, index) => (
            <li key={wincon.id}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate font-semibold">{wincon.name ?? "Unknown"}</span>
                <span className="shrink-0 text-sm text-base-content/70">
                  {wincon.games} games · {percent(ratio(wincon.games, total))}
                  {wincon.averagepower > 0 && <span className="badge badge-ghost badge-sm ml-2">Power {wincon.averagepower.toFixed(1)}</span>}
                </span>
              </div>
              <div className="mt-1 h-3 overflow-hidden rounded-full bg-base-200">
                <div className={`h-full rounded-full ${index === 0 ? "bg-linear-to-r from-accent to-primary" : "bg-accent/60"}`} style={{ width: `${(wincon.games / top) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

const MAX_PERIODS = 8;
const MAX_IDENTITIES = 10;

function IdentityTrends({ rows }: { rows: IdentityPeriodStat[] }) {
  const periods = [...new Set(rows.map(row => row.period))].sort().slice(-MAX_PERIODS);
  const recent = rows.filter(row => periods.includes(row.period));
  const periodTotals = new Map(periods.map(period => [period, recent.filter(row => row.period === period).reduce((sum, row) => sum + row.plays, 0)]));
  const byIdentity = new Map<number, { identity: IdentityPeriodStat; total: number; shares: Map<string, number> }>();
  for (const row of recent) {
    const entry = byIdentity.get(row.identityid) ?? { identity: row, total: 0, shares: new Map<string, number>() };
    entry.total += row.plays;
    entry.shares.set(row.period, ratio(row.plays, periodTotals.get(row.period) ?? 0));
    byIdentity.set(row.identityid, entry);
  }
  const identities = [...byIdentity.values()].sort((a, b) => b.total - a.total).slice(0, MAX_IDENTITIES);
  const peak = Math.max(0.01, ...identities.flatMap(entry => [...entry.shares.values()]));
  const [previous, latest] = periods.slice(-2);

  return (
    <Panel title="Color identities over time" description="Share of games per quarter. Darker means more popular.">
      {identities.length === 0 ? <p className="text-base-content/60">No games recorded yet.</p> : (
        <div className="overflow-x-auto">
          <table className="table text-base">
            <thead>
              <tr>
                <th>Identity</th>
                {periods.map(period => <th key={period} className="text-center font-mono text-sm">{period.replace("-", " ")}</th>)}
                <th className="text-right">Trend</th>
              </tr>
            </thead>
            <tbody>
              {identities.map(({ identity, shares }) => {
                const change = previous && latest ? (shares.get(latest) ?? 0) - (shares.get(previous) ?? 0) : 0;
                return (
                  <tr key={identity.identityid}>
                    <td>
                      <span className="flex items-center gap-3">
                        <IdentityPips identity={identity} />
                        <span className="capitalize">{identity.name ?? "Unnamed"}</span>
                      </span>
                    </td>
                    {periods.map(period => {
                      const share = shares.get(period) ?? 0;
                      return (
                        <td key={period} className="p-1 text-center">
                          <span
                            className={`block rounded-field px-2 py-2 font-mono text-sm ${share / peak > 0.55 ? "text-info-content" : ""}`}
                            style={{ backgroundColor: `color-mix(in oklab, var(--color-info) ${Math.round((share / peak) * 100)}%, transparent)` }}
                            title={`${percent(share)} of games in ${period}`}
                          >
                            {share ? `${Math.round(share * 100)}%` : "·"}
                          </span>
                        </td>
                      );
                    })}
                    <td className="text-right">
                      {Math.abs(change) < 0.005 ? <span className="text-base-content/50">—</span>
                        : <span className={`font-bold ${change > 0 ? "text-success" : "text-error"}`}>{change > 0 ? "▲" : "▼"} {Math.abs(change * 100).toFixed(1)}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

