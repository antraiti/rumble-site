'use client'

import UserData from "@/app/util/UserData";
import { normalizeDeckEntry, type NormalizedDeckEntry } from "@/app/util/deckCompatibility";
import { useDeckName, usePlayerName } from "@/app/components/DemoMode";
import { useEffect, useState, type ChangeEvent } from "react";

const FALLBACK_IMAGE = 'https://cards.scryfall.io/art_crop/front/0/e/0eb0e8e7-266f-441e-b1cd-12b8ec3f7d71.jpg'; // Imp's Mischief UwU

type Performance = { id: number; userid: number; username: string; deckid: number | null; placement: number | null; order: number | null; killedby: number | null };
type MatchInfo = { match: { id: number; name: string; power: number; start: string | null; end: string | null }; performances: Performance[] };
type MatchCardProps = {
    matchInfo: MatchInfo;
    decks: unknown[];
    themed: boolean;
    userlist: { id: number; username: string }[];
    updateMatch: (event: ChangeEvent<HTMLSelectElement> | { target: { name: string; value: string } }, performanceId: number) => void;
    addPerformance: (userId: string, matchId: number) => void;
    updateTimestamp: (matchId: number, prop: string) => void;
    requestMatchJoin: (matchId: number) => void;
    setMatchPower: (matchId: number, power: string) => void;
    randomizeTurnOrder: (matchId: number) => void;
};

function formatElapsed(ms: number) {
    const seconds = Math.floor(ms / 1000);
    return `${Math.floor(seconds / 3600)}:${(Math.floor(seconds / 60) % 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}

export default function MatchCard(props: MatchCardProps) {
    const { matchInfo, themed, userlist } = props;
    const { match, performances } = matchInfo;
    const { userId } = UserData();
    const deckName = useDeckName();
    const playerName = usePlayerName();
    const decks: NormalizedDeckEntry[] = (props.decks ?? [])
        .map(normalizeDeckEntry)
        .filter((deck: NormalizedDeckEntry | null): deck is NormalizedDeckEntry => deck !== null);
    const nameOf = (deck: Record<string, any>) => deckName(deck, [deck.commandername, deck.partnername]);
    const updatedAt = (deck: Record<string, any>) => (deck.lastupdated ? Date.parse(deck.lastupdated) : NaN) || 0;
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!match.start || match.end) return;
        const tick = () => setElapsed(Date.now() - new Date(match.start!).getTime());
        tick();
        const interval = window.setInterval(tick, 1000);
        return () => window.clearInterval(interval);
    }, [match.start, match.end]);

    const powerLabel = match.power == 1 ? "Competitive" : match.power == -1 ? "Casual" : "Normal";
    const placementOptions = match.end
        ? performances.map((_, index) => index + 1)
        : performances.slice(1).map((_, index) => index + 2);
    const selectClass = "select select-sm w-full md:select-md md:select-ghost";

    return (
        <section aria-label={match.name} className="card m-3 bg-base-100 shadow-md sm:m-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-box bg-base-200 px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-sm" aria-label="Match options">⋮</div>
                        <ul tabIndex={0} className="menu dropdown-content z-10 w-48 rounded-box bg-base-200 shadow-sm">
                            <li className="menu-title">Power</li>
                            {["Casual", "Normal", "Competitive"].map(power => (
                                <li key={power}><button type="button" onClick={() => props.setMatchPower(match.id, power)}>{power}</button></li>
                            ))}
                        </ul>
                    </div>
                    <h2 className="truncate text-xl font-bold">{match.name}</h2>
                    {match.power != 0 && <span className="badge badge-outline">{powerLabel}</span>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {!match.end && performances.length > 1 && (
                        <button type="button" className="btn btn-ghost btn-sm" disabled={!!match.start} title={match.start ? "Turn order can't change after the game starts" : undefined} onClick={() => props.randomizeTurnOrder(match.id)}>Randomise turn order</button>
                    )}
                    {match.start && <span className="text-sm text-base-content/70">Started {new Date(match.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>}
                    {match.start && !match.end && <span className="font-mono text-lg" aria-label="Elapsed time">{formatElapsed(elapsed)}</span>}
                    {match.end && <span className="text-sm text-base-content/70">Ended {new Date(match.end).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>}
                    {!match.start && <button type="button" className="btn btn-success btn-sm" onClick={() => props.updateTimestamp(match.id, "start")}>Start</button>}
                    {match.start && !match.end && (
                        <button type="button" className="btn btn-warning btn-sm" disabled={performances.some(p => p.order == null)} title={performances.some(p => p.order == null) ? "Set everyone's turn order first" : undefined} onClick={() => props.updateTimestamp(match.id, "end")}>End</button>
                    )}
                    {!match.start && <button type="button" className="btn btn-error btn-outline btn-sm" aria-label="Delete match" onClick={() => props.updateTimestamp(match.id, "delete")}>✕</button>}
                </div>
            </div>

            <div className="p-3 sm:p-4">
                <div className="hidden grid-cols-[5rem_8rem_minmax(0,2fr)_6rem_6rem_minmax(0,1fr)_2.5rem] gap-3 px-2 pb-2 text-sm font-semibold text-base-content/60 md:grid">
                    <span>Commander</span><span>Player</span><span>Deck</span><span>Placement</span><span>Turn order</span><span>Knocked out by</span><span />
                </div>
                <ul className="space-y-2">
                    {performances.map(performance => {
                        const deck = performance.deckid != null ? decks.find(d => d.deck.id == performance.deckid)?.deck ?? null : null;
                        const label = deck ? nameOf(deck) : "";
                        const player = playerName(performance.userid, performance.username);
                        const playerDecks = decks
                            .filter(entry => entry.deck.userid == performance.userid && (themed || entry.deck.islegal || entry.deck.id == performance.deckid))
                            .sort((first, second) => updatedAt(second.deck) - updatedAt(first.deck) || nameOf(first.deck).localeCompare(nameOf(second.deck)));
                        const winner = performance.placement == 1;
                        return (
                            <li key={performance.id} className={`grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded-box border bg-base-200/60 p-2 md:grid-cols-[5rem_8rem_minmax(0,2fr)_6rem_6rem_minmax(0,1fr)_2.5rem] ${winner ? "border-amber-300" : "border-transparent"}`}>
                                <div className="tooltip row-span-2 md:row-span-1" data-tip={label}>
                                    {performance.deckid != null
                                        ? <a href={`/deck/${performance.deckid}`} target="_blank" rel="noreferrer"><img className="h-16 w-full rounded-lg object-cover" src={deck?.image || FALLBACK_IMAGE} alt={label || "Deck"} /></a>
                                        : <img className="h-16 w-full rounded-lg object-cover opacity-50" src={FALLBACK_IMAGE} alt="No deck selected" />}
                                </div>
                                <span className="truncate font-semibold">{winner && <span aria-label="Winner">👑 </span>}{player}</span>
                                <select aria-label={`Deck for ${player}`} name="deckid" className={`${selectClass} col-start-2 md:col-start-auto`} value={performance.deckid?.toString() ?? ""} onChange={e => props.updateMatch(e, performance.id)}>
                                    <option value="">No deck selected</option>
                                    {playerDecks.map(entry => (
                                        <option value={entry.deck.id} key={entry.deck.id}>
                                            {nameOf(entry.deck)}{!entry.deck.islegal && !themed ? " (currently illegal)" : ""}
                                        </option>
                                    ))}
                                </select>
                                <div className="col-span-2 grid grid-cols-3 gap-2 md:contents">
                                    <label className="flex flex-col gap-1 text-xs text-base-content/60 md:contents">
                                        <span className="md:sr-only">Placement</span>
                                        <select aria-label={`Placement for ${player}`} name="placement" className={selectClass} value={performance.placement ?? ""} onChange={e => props.updateMatch(e, performance.id)}>
                                            <option value="">—</option>
                                            {placementOptions.map(place => <option value={place} key={place}>{place}</option>)}
                                        </select>
                                    </label>
                                    <label className="flex flex-col gap-1 text-xs text-base-content/60 md:contents">
                                        <span className="md:sr-only">Turn order</span>
                                        <select aria-label={`Turn order for ${player}`} name="order" className={selectClass} value={performance.order ?? ""} onChange={e => props.updateMatch(e, performance.id)}>
                                            <option value="">—</option>
                                            {performances.map((_, index) => <option value={index + 1} key={index}>{index + 1}</option>)}
                                        </select>
                                    </label>
                                    <label className="flex flex-col gap-1 text-xs text-base-content/60 md:contents">
                                        <span className="md:sr-only">Knocked out by</span>
                                        <select aria-label={`${player} knocked out by`} name="killedbyuid" className={selectClass} value={performance.killedby ?? ""} onChange={e => props.updateMatch(e, performance.id)}>
                                            <option value="">—</option>
                                            {performances.map(p => <option value={p.userid} key={p.id}>{playerName(p.userid, p.username)}</option>)}
                                        </select>
                                    </label>
                                </div>
                                {!match.start
                                    ? <button type="button" name="delete" aria-label={`Remove ${player} from match`} className="btn btn-error btn-outline btn-sm col-span-2 md:col-span-1" onClick={() => props.updateMatch({ target: { name: "delete", value: "" } }, performance.id)}>✕</button>
                                    : <span className="hidden md:block" />}
                            </li>
                        );
                    })}
                </ul>

                {!match.start && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {userlist.length > 0 && (
                            <label className="select select-sm w-auto">
                                <span className="label">Add player</span>
                                <select value="" onChange={e => e.target.value && props.addPerformance(e.target.value, match.id)}>
                                    <option value="">Choose…</option>
                                    {userlist.map(user => <option key={user.id} value={user.id}>{playerName(user.id, user.username)}</option>)}
                                </select>
                            </label>
                        )}
                        {!performances.some(p => p.userid == userId) && (
                            <button type="button" className="btn btn-info btn-outline btn-sm" onClick={() => props.requestMatchJoin(match.id)}>Join me</button>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
