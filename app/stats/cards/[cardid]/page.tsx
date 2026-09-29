'use client'
import Link from "next/link";
import { use } from "react";
import UserData from "../../../util/UserData";
import type { CardDetailStats } from "../../../types";
import { useStatsFetch } from "../../_components/useStatsFetch";
import { ActivityChart, ArtThumb, CardName, ErrorState, LoadingState, ManaCost, Panel, isScryfallId, percent, ratio } from "../../_components/StatsUi";

const monthLabel = (month: string) => new Date(`${month}-01T00:00:00`).toLocaleDateString(undefined, { month: "short", year: "2-digit" });
const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString() : "—");

export default function CardStatsPage({ params }: { params: Promise<{ cardid: string }> }) {
  const { cardid } = use(params);
  const { userToken } = UserData();
  const { data, error, loading } = useStatsFetch<CardDetailStats>(`stats/cards/${encodeURIComponent(decodeURIComponent(cardid))}`, userToken);

  if (error) return <ErrorState />;
  if (loading || !data) return <LoadingState rows={6} />;

  const { card } = data;
  const winRate = ratio(data.wins, data.placed);
  const delta = (winRate - data.baselinewinrate) * 100;
  const adoption = ratio(data.decks, data.eligibledecks);
  const topCommanderDecks = Math.max(1, ...data.commanders.map(commander => commander.decks));

  return (
    <div className="space-y-6">
      <Link href="/stats/cards" className="btn btn-ghost btn-sm -ml-2">← All cards</Link>

      <section className="relative isolate overflow-hidden rounded-box bg-neutral text-neutral-content shadow-lg">
        {data.artcrop && <img src={data.artcrop} alt="" className="absolute inset-0 -z-10 h-full w-full scale-105 object-cover opacity-50 blur-[2px]" />}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-neutral via-neutral/85 to-neutral/20" />
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:p-8">
          {data.image && (
            <img src={data.image} alt={card.name} className="w-44 shrink-0 rounded-[4.75%/3.5%] shadow-2xl ring-1 ring-black/40 transition-transform duration-300 hover:-rotate-2 hover:scale-105 sm:w-56" />
          )}
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap gap-2">
              {card.banned && <span className="badge badge-error">Banned</span>}
              {card.watchlist && <span className="badge badge-warning">Watchlist</span>}
              {card.custom && <span className="badge badge-accent">Custom</span>}
              {data.ascommander > 0 && <span className="badge badge-primary">Commander in {data.ascommander} {data.ascommander === 1 ? "deck" : "decks"}</span>}
            </div>
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">{card.name}</h2>
            <div className="flex flex-wrap items-center gap-3">
              <ManaCost cost={card.cost} />
              <span className="text-lg text-neutral-content/80">{card.typeline}</span>
            </div>
            <p className="text-neutral-content/70">First played {formatDate(data.firstplayed)} · Last played {formatDate(data.lastplayed)}</p>
            {isScryfallId(card.id) && (
              <a className="link link-hover text-sm" href={`https://scryfall.com/search?q=oracleid=${card.id}`} target="_blank" rel="noreferrer">View on Scryfall ↗</a>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile label="Games" value={data.plays} hint={`by ${data.players} ${data.players === 1 ? "player" : "players"}`} />
        <Tile
          label="Win rate"
          value={data.placed ? percent(winRate) : "—"}
          hint={data.placed ? (
            <span className={delta >= 0 ? "text-success" : "text-error"}>{delta >= 0 ? "+" : ""}{delta.toFixed(1)} pts vs avg</span>
          ) : "No placed games"}
        />
        <Tile label="Avg. place" value={data.placed ? (data.placementtotal / data.placed).toFixed(2) : "—"} hint={`${data.placed} placed games`} />
        <div className="flex items-center justify-between gap-3 rounded-box bg-base-100 p-5 shadow-sm">
          <div>
            <div className="text-base text-base-content/70">In decks</div>
            <div className="text-4xl font-black">{data.decks}</div>
            <div className="text-sm text-base-content/60">of {data.eligibledecks} that could</div>
          </div>
          <div
            role="progressbar"
            aria-label="Share of eligible decks"
            aria-valuenow={Math.round(adoption * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="radial-progress shrink-0 text-sm font-bold text-info"
            style={{ "--value": adoption * 100, "--size": "4rem", "--thickness": "6px" } as React.CSSProperties}
          >
            <span className="text-base-content">{Math.round(adoption * 100)}%</span>
          </div>
        </div>
      </div>

      {data.mine.plays > 0 && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-box border-l-4 border-info bg-base-100 px-5 py-4 shadow-sm">
          <span className="font-bold uppercase text-info">Your record</span>
          <span><b className="text-xl">{data.mine.plays}</b> games</span>
          <span><b className="text-xl">{data.mine.wins}</b> wins</span>
          <span><b className="text-xl">{percent(ratio(data.mine.wins, data.mine.plays))}</b> win rate</span>
        </div>
      )}

      <Panel title="Activity" description="Games with this card each month.">
        {data.monthly.length === 0
          ? <p className="text-base-content/60">Not played yet.</p>
          : <ActivityChart data={data.monthly.map(month => ({ label: monthLabel(month.month), total: month.plays, highlight: month.wins }))} totalLabel="Games" highlightLabel="Wins" />}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Top commanders" description="Commanders whose decks run this card.">
          {data.commanders.length === 0 ? <p className="text-base-content/60">No other commanders run it yet.</p> : (
            <ul className="space-y-3">
              {data.commanders.map(commander => (
                <li key={commander.cardid} className="flex items-center gap-3">
                  <ArtThumb src={commander.artcrop} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate"><CardName id={commander.cardid} name={commander.name} /></div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-base-200">
                      <div className="h-full rounded-full bg-info" style={{ width: `${(commander.decks / topCommanderDecks) * 100}%` }} />
                    </div>
                  </div>
                  <span className="w-16 text-right font-mono">{commander.decks} {commander.decks === 1 ? "deck" : "decks"}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Often played with" description="Cards that show up alongside it far more than usual.">
          {data.pairs.length === 0 ? <p className="text-base-content/60">Not enough decks to find pairings yet.</p> : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {data.pairs.map(pair => (
                <li key={pair.cardid}>
                  <Link href={`/stats/cards/${encodeURIComponent(pair.cardid)}`} className="group relative block aspect-[4/3] overflow-hidden rounded-box bg-base-300 focus-visible:outline-2 focus-visible:outline-primary">
                    {pair.artcrop && <img src={pair.artcrop} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />}
                    <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/85 via-black/30 to-transparent p-2 text-white">
                      <span className="truncate text-sm font-bold" title={pair.name}>{pair.name}</span>
                      <span className="text-xs text-white/80">{percent(pair.share)} of its decks · {pair.lift.toFixed(1)}×</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Tile({ label, value, hint }: { label: string; value: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="rounded-box bg-base-100 p-5 shadow-sm">
      <div className="text-base text-base-content/70">{label}</div>
      <div className="text-4xl font-black">{value}</div>
      {hint && <div className="mt-1 text-sm text-base-content/60">{hint}</div>}
    </div>
  );
}
