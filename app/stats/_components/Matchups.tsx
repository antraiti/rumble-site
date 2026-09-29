'use client'
import type { ReactNode } from "react";
import UserData from "../../util/UserData";
import type { PlayerCount, PlayerMatchups } from "../../types";
import { useStatsOptions } from "./StatsShell";
import { useStatsFetch } from "./useStatsFetch";
import { EmptyRow, ErrorState, Panel, PlayerLink, SeatChart, formatDuration, percent, ratio } from "./StatsUi";

const times = (count: number) => `${count} ${count === 1 ? "time" : "times"}`;

export default function Matchups({ userId, name, isSelf, overallWinRate }: { userId: string | number; name?: string; isSelf: boolean; overallWinRate?: number }) {
  const { userToken } = UserData();
  const { includeThemed } = useStatsOptions();
  const { data, error, loading } = useStatsFetch<PlayerMatchups>(`stats/users/${userId}/matchups?themed=${includeThemed}`, userToken);

  if (error) return <ErrorState />;
  if (loading || !data) return <div className="grid gap-4 md:grid-cols-3" aria-busy="true">{[0, 1, 2].map(index => <div key={index} className="skeleton h-36" />)}</div>;

  const subject = isSelf ? "you" : name ?? "them";
  const actor = isSelf ? "You" : name ?? "They";
  const topGames = Math.max(1, ...data.podmates.map(mate => mate.games));
  const paceDelta = data.pace.mine - data.pace.global;
  const showPrivate = isSelf && data.streaks && data.seats;

  return (
    <section aria-labelledby="matchups-heading" className="space-y-4">
      <h2 id="matchups-heading" className="text-2xl font-bold">Matchups</h2>

      <div className="grid gap-4 md:grid-cols-3">
        <RivalCard label="Nemesis" tone="error" rivals={data.nemeses} line={count => `Knocked ${subject} out ${times(count)}`} highlight />
        <RivalCard label="Favourite target" tone="success" rivals={data.victims} line={count => `${actor} knocked them out ${times(count)}`} />
        <InsightCard label="Pace" tone="info">
          <div className="text-2xl font-bold">{data.pace.mine ? formatDuration(data.pace.mine) : "—"}</div>
          <p className="text-base-content/70">Avg. game length</p>
          {data.pace.mine > 0 && data.pace.global > 0 && (
            <p className="mt-2 text-sm text-base-content/60">
              {formatDuration(Math.abs(paceDelta))} {paceDelta <= 0 ? "faster" : "slower"} than the {formatDuration(data.pace.global)} average
            </p>
          )}
        </InsightCard>
      </div>

      <div className={`grid gap-4 ${showPrivate ? "lg:grid-cols-5" : ""}`}>
        <Panel title="Pod-mates" description={isSelf ? "Who you play with most, and your win rate when they're at the table." : `Who ${subject} plays with most.`} className={showPrivate ? "lg:col-span-3" : ""}>
          <div className="overflow-x-auto">
            <table className="table text-base">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Games together</th>
                  {isSelf && <th className="text-right">Win rate</th>}
                </tr>
              </thead>
              <tbody>
                {data.podmates.length === 0 ? <EmptyRow colSpan={isSelf ? 3 : 2}>No games yet.</EmptyRow> : data.podmates.map(mate => {
                  const rate = ratio(mate.wins ?? 0, mate.games);
                  return (
                    <tr key={mate.userid}>
                      <td><PlayerLink id={mate.userid} name={mate.username} className="font-medium" /></td>
                      <td className="min-w-40">
                        <div className="flex items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-base-200">
                            <div className="h-full rounded-full bg-secondary" style={{ width: `${(mate.games / topGames) * 100}%` }} />
                          </div>
                          <span className="w-8 text-right font-mono">{mate.games}</span>
                        </div>
                      </td>
                      {isSelf && (
                        <td className={`text-right font-mono ${overallWinRate === undefined ? "" : rate > overallWinRate ? "text-success" : "text-error"}`}>{percent(rate)}</td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        {showPrivate && (
          <div className="grid content-start gap-4 lg:col-span-2">
            <Panel title="Streaks">
              <dl className="grid grid-cols-3 divide-x divide-base-content/10 text-center">
                <Streak label="Longest" value={data.streaks!.longest} />
                <Streak label="Current" value={data.streaks!.current} />
                <Streak label="Since last win" value={data.streaks!.everwon ? data.streaks!.sincelastwin : "—"} />
              </dl>
            </Panel>
            <Panel title="Win rate by seat">
              <SeatChart seats={data.seats!} />
            </Panel>
          </div>
        )}
      </div>
    </section>
  );
}

const tones = {
  error: { bar: "bg-error", text: "text-error" },
  success: { bar: "bg-success", text: "text-success" },
  info: { bar: "bg-info", text: "text-info" },
};

function InsightCard({ label, tone, children }: { label: string; tone: keyof typeof tones; children: ReactNode }) {
  return (
    <div className="relative h-full overflow-hidden rounded-box bg-base-100 p-5 pt-6 shadow-sm">
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${tones[tone].bar}`} />
      <p className={`text-sm font-bold uppercase tracking-wide ${tones[tone].text}`}>{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function RivalCard({ label, tone, rivals, line, highlight = false }: {
  label: string; tone: keyof typeof tones; rivals: PlayerCount[]; line: (count: number) => string; highlight?: boolean;
}) {
  const [top, ...rest] = rivals;
  const card = (
    <InsightCard label={label} tone={tone}>
      {top ? (
        <>
          <PlayerLink id={top.userid} name={top.username} className="text-2xl font-bold" />
          <p className="text-base-content/70">{line(top.count)}</p>
          {rest.length > 0 && (
            <p className="mt-2 text-sm text-base-content/60">
              Then {rest.map((rival, index) => (
                <span key={rival.userid}>{index > 0 && ", "}<PlayerLink id={rival.userid} name={rival.username} className="" /> ({rival.count})</span>
              ))}
            </p>
          )}
        </>
      ) : <p className="text-base-content/60">No knockouts recorded yet.</p>}
    </InsightCard>
  );
  return top && highlight ? <div className={`aura block h-full ${tones[tone].text}`}>{card}</div> : card;
}

function Streak({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col-reverse px-2">
      <dt className="text-sm text-base-content/70">{label}</dt>
      <dd className="text-3xl font-black">{value}</dd>
    </div>
  );
}
