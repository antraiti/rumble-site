'use client'
import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import userData from "../../util/UserData"
import { apiGet, apiPost } from "../../util/apiClient";
import PageHeader from "../../components/PageHeader";
import { CardImage, CardPreviewRow, CategoryHeading, ManaSymbols, StatusIcon } from "../../components/CardList";
import { DeckName, PlayerName, useDeckName } from "../../components/DemoMode";
import type { User } from "../../types";

type DeckEntry = { cardid: string; count: number; iscommander: boolean; iscompanion: boolean; issideboard: boolean };
type DeckCardInfo = { id: string; name: string; typeline: string; cost?: string; mv: number; watchlist?: boolean; banned?: boolean };
type CardRow = [DeckEntry, DeckCardInfo];
type HistoryEntry = { matchid: number; eventid: number; eventname: string; themed: boolean; start: string | null; players: number; placement?: number | null };
type DeckResponse = {
    deck: { id: number; userid: number; name: string; commander: string | null; partner: string | null; lastupdated?: string | null };
    cardlist: CardRow[] | null;
    printings: { id: string; cardid: string; cardimage: string }[] | null;
    legality: { legal: boolean; messages: string[] | null };
    history?: HistoryEntry[] | null;
};

// Checked in order; a card lands in the first category its type line matches.
const TYPE_CATEGORIES = [
    ["Creatures", "creature"],
    ["Planeswalkers", "planeswalker"],
    ["Battles", "battle"],
    ["Sorceries", "sorcery"],
    ["Instants", "instant"],
    ["Artifacts", "artifact"],
    ["Enchantments", "enchantment"],
    ["Lands", "land"],
] as const;
const CURVE_BUCKETS = ["0", "1", "2", "3", "4", "5", "6", "7+"];
const HAND_SIZE = 7;

const count = (rows: CardRow[]) => rows.reduce((total, [entry]) => total + entry.count, 0);
const isLand = (card: DeckCardInfo) => card.typeline.toLowerCase().includes("land");

function shuffle<T>(items: T[]) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

export default function DeckView({ params }: { params: Promise<{ deckid: number }> }) {
    const { deckid } = use(params);
    const { userToken, userId, isAdmin } = userData();
    const router = useRouter();
    const deckName = useDeckName();
    const [deckData, setDeckData] = useState<DeckResponse | null>(null);
    const [loadError, setLoadError] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [copied, setCopied] = useState(false);
    const [actionError, setActionError] = useState("");
    const [library, setLibrary] = useState<DeckCardInfo[]>([]);
    const [handSize, setHandSize] = useState(HAND_SIZE);

    useEffect(() => {
        apiGet<DeckResponse>(`deck/${deckid}`, { token: userToken }).then(setDeckData).catch(() => setLoadError(true));
        // The owner's name needs a login; signed-out visitors can still view the deck.
        if (userToken) apiGet<User[]>("users", { token: userToken }).then(setUsers).catch(() => {});
    }, [deckid, userToken]);

    const groups = useMemo(() => {
        const cards = deckData?.cardlist ?? [];
        const main = cards.filter(([entry]) => !entry.issideboard);
        const commanders = main.filter(([entry]) => entry.iscommander);
        const companions = cards.filter(([entry]) => entry.iscompanion);
        const rest = main.filter(([entry]) => !entry.iscommander && !entry.iscompanion);
        const byType = TYPE_CATEGORIES.map(([label, type]) => ({
            label,
            rows: rest.filter(([, card]) => TYPE_CATEGORIES.find(([, t]) => card.typeline.toLowerCase().includes(t))?.[1] === type),
        }));
        const other = rest.filter(([, card]) => !TYPE_CATEGORIES.some(([, type]) => card.typeline.toLowerCase().includes(type)));
        return {
            main,
            commanders,
            companions,
            categories: [...byType, { label: "Other", rows: other }].filter(group => group.rows.length > 0),
            sideboard: cards.filter(([entry]) => entry.issideboard && !entry.iscompanion),
        };
    }, [deckData]);

    const stats = useMemo(() => {
        const curve = CURVE_BUCKETS.map(() => 0);
        let spells = 0, totalMv = 0;
        for (const [entry, card] of groups.main) {
            if (isLand(card)) continue;
            curve[Math.min(card.mv, 7)] += entry.count;
            spells += entry.count;
            totalMv += card.mv * entry.count;
        }
        const lands = count(groups.main.filter(([, card]) => isLand(card)));
        return { curve, spells, lands, averageMv: spells ? totalMv / spells : 0, total: count(groups.main) };
    }, [groups]);

    if (loadError) {
        return (
            <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
                <div role="alert" className="alert alert-error">Couldn&apos;t load this deck. It may have been deleted, or the server is unavailable.</div>
            </main>
        );
    }

    if (!deckData) {
        return (
            <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8" aria-busy="true">
                <div className="skeleton h-24 w-full" />
                <div className="mt-6 grid gap-4 md:grid-cols-3">{[0, 1, 2].map(index => <div key={index} className="skeleton h-40" />)}</div>
                <div className="skeleton mt-6 h-96 w-full" />
            </main>
        );
    }

    const { deck, legality } = deckData;
    const printings = deckData.printings ?? [];
    const imageFor = (card: DeckCardInfo) => printings.find(printing => printing.cardid === card.id)?.cardimage;
    const commanderNames = [deck.commander, deck.partner].map(id => deckData.cardlist?.find(([, card]) => card.id === id)?.[1].name);
    const owner = users.find(user => user.id === deck.userid);
    const canEdit = !!userToken && (Number(userId) === deck.userid || !!isAdmin);
    const history = deckData.history ?? [];
    const showPlacement = history.some(entry => entry.placement != null);
    const hand = library.slice(0, handSize);

    function listText() {
        const line = ([entry, card]: CardRow) => `${entry.count} ${card.name}`;
        const main = groups.main.map(line).join("\n");
        const side = groups.sideboard.map(line).join("\n");
        return side ? `${main}\n\nSideboard\n${side}` : main;
    }

    async function copyList() {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(listText());
            } else {
                // The Clipboard API needs HTTPS; fall back to a hidden textarea on plain-HTTP hosts.
                const textArea = document.createElement("textarea");
                textArea.value = listText();
                textArea.style.position = "absolute";
                textArea.style.left = "-999999px";
                document.body.prepend(textArea);
                textArea.select();
                document.execCommand("copy");
                textArea.remove();
            }
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setActionError("Couldn't copy to the clipboard.");
        }
    }

    function steal() {
        setActionError("");
        apiPost(`deck/${deckid}/steal`, { token: userToken })
            .then(() => router.push("/decks"))
            .catch(error => setActionError(error instanceof Error ? error.message : "Couldn't copy this deck."));
    }

    function newHand() {
        const cards = groups.main
            .filter(([entry]) => !entry.iscommander && !entry.iscompanion)
            .flatMap(([entry, card]) => Array.from({ length: entry.count }, () => card));
        setLibrary(shuffle(cards));
        setHandSize(HAND_SIZE);
        (document.getElementById("sample_hand") as HTMLDialogElement | null)?.showModal();
    }

    function CardDisplay([entry, card]: CardRow) {
        const roleClass = entry.iscommander ? "border-l-warning bg-warning/5" : entry.iscompanion ? "border-l-info bg-info/5" : "border-l-transparent";
        return (
            <CardPreviewRow key={card.id} image={printings.find(printing => printing.cardid === card.id)?.cardimage} name={card.name}>
                <article className={`flex min-h-9 w-full items-center gap-1.5 overflow-hidden rounded-md border border-base-300 border-l-2 bg-base-100 px-1 py-1 transition-colors hover:border-primary/50 hover:bg-base-200 ${roleClass}`}>
                    <span aria-label={`${entry.count} copies`} title={`${entry.count} in deck`} className="flex w-8 shrink-0 self-stretch items-center justify-center border-r border-base-content/10 font-mono text-base font-bold text-base-content/75">
                        {entry.count}
                    </span>
                    <a className="min-w-0 flex-1 truncate text-sm font-medium leading-snug hover:text-primary hover:underline" href={`https://scryfall.com/search?q=oracleid=${card.id}`} target="_blank" rel="noreferrer" title={card.name}>
                        {card.name.split("//")[0].trim()}
                    </a>
                    <div className="flex shrink-0 items-center gap-1">
                        {entry.iscommander && <StatusIcon src="/crown-svgrepo-com.svg" label="Commander" color="bg-warning" />}
                        {entry.iscompanion && <StatusIcon src="/person-team.svg" label="Companion" color="bg-info" />}
                        {card.watchlist && <StatusIcon src="/star-svgrepo-com.svg" label="On watchlist" color="bg-warning" />}
                        {card.banned && <StatusIcon src="/alert-svgrepo.svg" label="Banned card" color="bg-error" />}
                    </div>
                    <ManaSymbols cost={card.cost} />
                </article>
            </CardPreviewRow>
        );
    }

    const peak = Math.max(1, ...stats.curve);

    return (
        <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
            <PageHeader
                eyebrow="Rumble / Deck"
                title={<DeckName deck={deck} commanders={commanderNames} />}
                actions={<>
                    <button type="button" className="btn btn-primary" onClick={copyList}>{copied ? "Copied!" : "Copy decklist"}</button>
                    <button type="button" className="btn btn-outline" onClick={newHand}>Sample hand</button>
                    <Link href={`/exportdeck/${deck.id}`} className="btn btn-outline">Export for TTS</Link>
                    {canEdit && <Link href={`/deckdetails/${deck.id}`} className="btn btn-outline">Edit deck</Link>}
                    {userToken && <button type="button" className="btn btn-ghost" title="Creates a copy of this deck on your account" onClick={steal}>Steal a copy</button>}
                </>}
            >
                <span className="flex flex-wrap items-center gap-2 text-base">
                    {owner && <span>By <PlayerName id={owner.id} name={owner.username} /></span>}
                    <span className={`badge badge-soft ${legality.legal ? "badge-success" : "badge-error"}`}>{legality.legal ? "Legal" : "Not legal"}</span>
                </span>
            </PageHeader>

            {actionError && <div role="alert" className="alert alert-warning alert-soft mt-5">{actionError}</div>}
            {!legality.legal && (legality.messages?.length ?? 0) > 0 && (
                <div role="alert" className="alert alert-error alert-soft mt-5">
                    <ul className="list-disc pl-5">{legality.messages!.map(message => <li key={message}>{message}</li>)}</ul>
                </div>
            )}

            <section aria-label="Deck overview" className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="card bg-base-100 shadow-sm md:col-span-2">
                    <div className="card-body gap-3 p-5">
                        <h2 className="card-title text-lg">Mana curve</h2>
                        <div className="flex h-36 items-end gap-2" role="img" aria-label={`Mana curve: ${CURVE_BUCKETS.map((bucket, index) => `${stats.curve[index]} at ${bucket}`).join(", ")}`}>
                            {stats.curve.map((value, index) => (
                                <div key={CURVE_BUCKETS[index]} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                                    <span className="text-sm font-bold">{value || ""}</span>
                                    <div className="w-full rounded-t bg-primary" style={{ height: value ? `${(value / peak) * 100}%` : "2px" }} />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 text-center text-sm text-base-content/60">
                            {CURVE_BUCKETS.map(bucket => <span key={bucket} className="flex-1">{bucket}</span>)}
                        </div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-sm">
                    <div className="card-body gap-3 p-5">
                        <h2 className="card-title text-lg">At a glance</h2>
                        <dl className="grid grid-cols-3 gap-2 text-center">
                            <Stat label="Cards" value={stats.total} />
                            <Stat label="Lands" value={stats.lands} />
                            <Stat label="Avg. MV" value={stats.averageMv.toFixed(2)} />
                        </dl>
                        <ul className="space-y-1">
                            {groups.categories.map(group => (
                                <li key={group.label} className="flex items-center justify-between gap-3">
                                    <span>{group.label}</span>
                                    <span className="font-mono text-base-content/70">{count(group.rows)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section aria-labelledby="mainboard-heading" className="mt-8">
                <h2 id="mainboard-heading" className="mb-2 text-xl font-bold">Mainboard</h2>
                <div className="columns-1 gap-3 md:columns-2 xl:columns-3">
                    <CategoryHeading label={`Commander${groups.commanders.length > 1 ? "s" : ""}`} count={count(groups.commanders)} />
                    {groups.commanders.map(CardDisplay)}
                    {groups.companions.length > 0 && <CategoryHeading label="Companion" count={count(groups.companions)} />}
                    {groups.companions.map(CardDisplay)}
                    {groups.categories.map(group => (
                        <div key={group.label} className="contents">
                            <CategoryHeading label={group.label} count={count(group.rows)} />
                            {group.rows.map(CardDisplay)}
                        </div>
                    ))}
                </div>
            </section>

            {groups.sideboard.length > 0 && (
                <section aria-labelledby="sideboard-heading" className="mt-8">
                    <h2 id="sideboard-heading" className="mb-2 text-xl font-bold">Sideboard <span className="font-mono text-base font-normal text-base-content/60">{count(groups.sideboard)}</span></h2>
                    <div className="columns-1 gap-3 md:columns-2 xl:columns-3">{groups.sideboard.map(CardDisplay)}</div>
                </section>
            )}

            {userToken && (
                <section aria-labelledby="history-heading" className="card mt-8 bg-base-100 shadow-sm">
                    <div className="card-body gap-3 p-5">
                        <h2 id="history-heading" className="card-title text-lg">Match history</h2>
                        {history.length === 0 ? <p className="text-base-content/60">Not played yet.</p> : (
                            <div className="overflow-x-auto">
                                <table className="table text-base">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Event</th>
                                            <th className="text-right">Players</th>
                                            {showPlacement && <th className="text-right">Placed</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map(entry => (
                                            <tr key={entry.matchid}>
                                                <td>{entry.start ? new Date(entry.start).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Not started"}</td>
                                                <td><Link href={`/events/${entry.eventid}`} className="hover:text-primary hover:underline">{entry.eventname}</Link>{entry.themed && <span className="badge badge-info badge-outline badge-sm ml-2">Themed</span>}</td>
                                                <td className="text-right font-mono">{entry.players}</td>
                                                {showPlacement && <td className="text-right font-mono">{entry.placement ?? "—"}</td>}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>
            )}

            <dialog id="sample_hand" className="modal">
                <div className="modal-box w-11/12 max-w-6xl">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" aria-label="Close">✕</button>
                    </form>
                    <h2 className="text-xl font-bold">Sample hand</h2>
                    <p className="text-sm text-base-content/70">{deckName(deck, commanderNames)} · {library.length - hand.length} cards left in library</p>
                    <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                        {hand.map((card, index) => (
                            <CardImage key={`${card.id}-${index}`} image={imageFor(card)} name={card.name} className="w-full rounded-[4.75%/3.5%] shadow" />
                        ))}
                    </div>
                    <div className="modal-action">
                        <button type="button" className="btn btn-outline" disabled={hand.length >= library.length} onClick={() => setHandSize(size => size + 1)}>Draw a card</button>
                        <button type="button" className="btn btn-primary" onClick={newHand}>New hand</button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop"><button>close</button></form>
            </dialog>
        </main>
    );
}

function Stat({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="flex flex-col-reverse rounded-field bg-base-200 p-2">
            <dt className="text-sm text-base-content/60">{label}</dt>
            <dd className="text-2xl font-bold">{value}</dd>
        </div>
    );
}
