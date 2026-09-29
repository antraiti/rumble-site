'use client'
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import userData from "../util/UserData"
import DeckCard, { type DeckStats, type DeckSummary } from "./DeckCard";
import { apiGet } from "../util/apiClient";
import type { Color, DeckWithCards, Performance } from "../types";

type ColorKey = "white" | "blue" | "black" | "red" | "green";
type SortKey = "recent" | "name" | "games" | "winrate";

const colorToggles: { key: ColorKey; label: string; icon: string }[] = [
    { key: "white", label: "White", icon: "/W.svg" },
    { key: "blue", label: "Blue", icon: "/U.svg" },
    { key: "black", label: "Black", icon: "/B.svg" },
    { key: "red", label: "Red", icon: "/R.svg" },
    { key: "green", label: "Green", icon: "/G.svg" },
];

const emptyStats = (): DeckStats => ({ games: 0, wins: 0, placementTotal: 0, placed: 0 });

export default function Decks() {
    const { userToken } = userData();
    const [decks, setDecks] = useState<DeckWithCards[] | null>(null);
    const [performances, setPerformances] = useState<Performance[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const [error, setError] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedColors, setSelectedColors] = useState<ColorKey[]>([]);
    const [sort, setSort] = useState<SortKey>("recent");

    useEffect(() => {
        let active = true;
        apiGet<Color[]>("colors").then(items => { if (active) setColors(items); }).catch(() => {});
        apiGet<{ deckandcards: DeckWithCards[] | null; performances: Performance[] | null }>("decks", { token: userToken })
            .then(items => {
                if (!active) return;
                setDecks(items.deckandcards ?? []);
                setPerformances(items.performances ?? []);
            })
            .catch(() => { if (active) setError(true); });
        return () => { active = false; };
    }, [userToken]);

    const summaries = useMemo<DeckSummary[]>(() => {
        const statsByDeck = new Map<number, DeckStats>();
        for (const performance of performances) {
            if (performance.deckid == null) continue;
            const stats = statsByDeck.get(performance.deckid) ?? emptyStats();
            stats.games++;
            if (performance.placement != null) {
                stats.placed++;
                stats.placementTotal += performance.placement;
                if (performance.placement === 1) stats.wins++;
            }
            statsByDeck.set(performance.deckid, stats);
        }
        return (decks ?? []).map(([deck, commander, partner, companion]) => ({
            deck, commander, partner, companion,
            color: colors.find(color => color.id === deck.identityid),
            stats: statsByDeck.get(deck.id) ?? emptyStats(),
        }));
    }, [decks, performances, colors]);

    const visible = useMemo(() => {
        const term = search.trim().toLowerCase();
        const winRate = (summary: DeckSummary) => (summary.stats.games ? summary.stats.wins / summary.stats.games : -1);
        return summaries
            .filter(summary => {
                const text = [summary.deck.name, summary.commander?.name, summary.partner?.name, summary.companion?.name].filter(Boolean).join(" ").toLowerCase();
                if (term && !text.includes(term)) return false;
                if (selectedColors.length === 0) return true;
                // Exact color identity match, as before.
                return !!summary.color && colorToggles.every(toggle => selectedColors.includes(toggle.key) === summary.color![toggle.key]);
            })
            .sort((a, b) => {
                switch (sort) {
                    case "name": return a.deck.name.localeCompare(b.deck.name);
                    case "games": return b.stats.games - a.stats.games;
                    case "winrate": return winRate(b) - winRate(a);
                    default: return b.deck.id - a.deck.id;
                }
            });
    }, [summaries, search, selectedColors, sort]);

    function toggleColor(key: ColorKey) {
        setSelectedColors(prev => (prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key]));
    }

    return (
        <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
            <header className="flex flex-wrap items-end justify-between gap-4 border-b border-base-content/15 pb-5">
                <div>
                    <p className="text-sm font-bold uppercase text-primary">Rumble / Decks</p>
                    <h1 className="mt-1 text-3xl font-bold">My decks</h1>
                </div>
                <Link href="/decks/newdeck" className="btn btn-primary">New deck</Link>
            </header>

            <div className="mt-5 flex flex-wrap items-center gap-3">
                <label className="input w-full sm:w-80">
                    <span className="label">Search</span>
                    <input type="search" placeholder="Deck or commander" value={search} onChange={e => setSearch(e.target.value)} />
                </label>
                <div className="join" role="group" aria-label="Filter by exact colors">
                    {colorToggles.map(toggle => {
                        const on = selectedColors.includes(toggle.key);
                        return (
                            <button key={toggle.key} type="button" aria-pressed={on} title={toggle.label} className={`btn join-item px-3 ${on ? "btn-active" : ""}`} onClick={() => toggleColor(toggle.key)}>
                                <img src={toggle.icon} alt={toggle.label} className={`size-5 ${on ? "" : "opacity-50 grayscale"}`} />
                            </button>
                        );
                    })}
                </div>
                {selectedColors.length > 0 && <button type="button" className="btn btn-ghost" onClick={() => setSelectedColors([])}>Clear colors</button>}
                <label className="select w-full sm:ml-auto sm:w-auto">
                    <span className="label">Sort</span>
                    <select value={sort} onChange={e => setSort(e.target.value as SortKey)}>
                        <option value="recent">Newest</option>
                        <option value="name">Name</option>
                        <option value="games">Most played</option>
                        <option value="winrate">Win rate</option>
                    </select>
                </label>
            </div>

            <section className="mt-6" aria-live="polite">
                {error ? (
                    <div role="alert" className="alert alert-error">Couldn&apos;t load your decks. Try refreshing the page.</div>
                ) : decks === null ? (
                    <div className="grid gap-4 lg:grid-cols-2" aria-busy="true">
                        {[0, 1, 2, 3].map(index => <div key={index} className="skeleton h-40 w-full" />)}
                    </div>
                ) : visible.length === 0 ? (
                    <div className="rounded-box border border-dashed border-base-content/20 px-6 py-12 text-center">
                        {summaries.length === 0 ? (
                            <>
                                <p className="text-lg font-semibold">No decks yet</p>
                                <p className="mt-1 text-base-content/70">Import a decklist to get started.</p>
                                <Link href="/decks/newdeck" className="btn btn-primary mt-4">New deck</Link>
                            </>
                        ) : <p className="text-base-content/70">No decks match these filters.</p>}
                    </div>
                ) : (
                    <>
                        <p className="mb-3 text-sm text-base-content/60">{visible.length} of {summaries.length} decks</p>
                        <div className="grid gap-4 lg:grid-cols-2">
                            {visible.map(summary => <DeckCard key={summary.deck.id} summary={summary} />)}
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}