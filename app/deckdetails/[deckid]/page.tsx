'use client'
import Link from "next/link";
import { use, useEffect, useState, type ReactNode } from "react";
import userData from "../../util/UserData"
import { useRouter } from "next/navigation";
import { apiGet, apiPut } from "../../util/apiClient";

type DeckEntry = { cardid: string; issideboard?: boolean };
type DeckCard = { name: string; typeline?: string; custom?: boolean };
type CardListItem = [DeckEntry, DeckCard];
type Printing = { cardid: string; artcrop: string };
type CustomCard = { id: string; name: string };
type DeckDetailsResponse = {
    deck: { id: number; name: string; image?: string; commander?: string | null; partner?: string | null; companion?: string | null };
    cardlist: CardListItem[] | null;
    legality: { legal: boolean; messages: string[] | null };
    performances: unknown[] | null;
    printings: Printing[] | null;
    customcards: CustomCard[] | null;
};

const commanderTypes = ["Creature", "Planeswalker", "Vehicle", "Artifact", "Spacecraft"];
const partnerTypes = ["Creature", "Planeswalker", "Background"];

function isLegendary(card: DeckCard, types: string[]) {
    const typeline = card.typeline ?? "";
    return typeline.includes("Legendary") && types.some(type => typeline.includes(type));
}

async function getDeckInfo(token: string, id: number) {
    return apiGet<DeckDetailsResponse>(`deck/${id}`, { token });
  }

  async function updateDeck(token: string, id: number, prop: string, val: string) {
    return apiPut(`deck/${id}`, { token, body: { prop, val } });
  }

  async function sendDeleteDeckRequest(token: string, id: number) {
    return apiPut(`deck/remove/${id}`, { token });
}

export interface DeckDetailsProps {
    deckid: number;
}

export default function DeckDetails({ params }: { params: Promise<DeckDetailsProps>}) {
    const {deckid} = use(params);
    const { userToken } = userData();
    const router = useRouter();
    const [deckInfo, setDeckInfo] = useState<DeckDetailsResponse["deck"] | null>(null);
    const [deckName, setDeckName] = useState("");
    const [deckCommander, setDeckCommander] = useState<string | null>();
    const [deckPartner, setDeckPartner] = useState<string | null>();
    const [deckCompanion, setDeckCompanion] = useState<string | null>();
    const [cardList, setCardList] = useState<CardListItem[]>([]);
    const [customCards, setCustomCards] = useState<CustomCard[]>([]);
    const [deckLegality, setDeckLegality] = useState(true);
    const [deckLegalityMessages, setDeckLegalityMessages] = useState<string[]>([]);
    const [gamesPlayed, setGamesPlayed] = useState(0);
    const [ctimer, setCtimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    const [printingList, setPrintingList] = useState<Printing[]>([]);
    const [loadError, setLoadError] = useState(false);
    const [updateError, setUpdateError] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    function fetchDeckInfo() {
        getDeckInfo(userToken, deckid).then((item) => {
            setDeckInfo(item.deck);
            setDeckName(item.deck.name);
            setDeckCommander(item.deck.commander);
            setDeckPartner(item.deck.partner);
            setDeckCompanion(item.deck.companion);
            setCardList(item.cardlist ?? []);
            setDeckLegality(item.legality.legal);
            setDeckLegalityMessages(item.legality.messages ?? []);
            setGamesPlayed(item.performances?.length ?? 0);
            setPrintingList(item.printings ?? []);
            setCustomCards(item.customcards ?? []);
        }).catch(() => setLoadError(true));
    }

    useEffect(() => {
        fetchDeckInfo();
    },[])

    function sendDeckUpdate(prop: string, val: string) {
        setUpdateError(false);
        updateDeck(userToken, deckid, prop, val)
            .then(() => fetchDeckInfo())
            .catch(() => setUpdateError(true));
    }

    function deleteDeck() {
        sendDeleteDeckRequest(userToken, deckid)
            .then(() => router.push("/decks"))
            .catch(() => setUpdateError(true));
    }

    function changeDelay(prop: string, val: string) {
        if (ctimer) {
          clearTimeout(ctimer);
          setCtimer(null);
        }
        setCtimer(
          setTimeout(() => {
            updateDeck(userToken, deckid, prop, val).catch(() => setUpdateError(true));
          }, 500)
        );
    }

    if (loadError) {
        return (
            <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
                <div role="alert" className="alert alert-error">Couldn&apos;t load this deck. Try refreshing the page.</div>
            </main>
        );
    }

    if (!deckInfo) {
        return (
            <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8" aria-busy="true">
                <div className="skeleton h-20 w-full" />
                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                    <div className="skeleton h-96 w-full" />
                    <div className="skeleton h-96 w-full" />
                </div>
            </main>
        );
    }

    const played = gamesPlayed > 0;
    const commanderOptions = cardList.filter(([, card]) => isLegendary(card, commanderTypes));
    const partnerOptions = cardList.filter(([, card]) => isLegendary(card, partnerTypes));
    const sideboard = cardList.filter(([entry]) => entry.issideboard);
    const sideboardToAdd = cardList.filter(([entry]) => !entry.issideboard);
    const customInDeck = cardList.filter(([, card]) => card.custom);
    const customToAdd = customCards.filter(cc => !cc.id.endsWith("/back") && !cardList.some(([entry]) => entry.cardid === cc.id));
    const artOptions = printingList.filter(p => p.cardid === deckCommander || p.cardid === deckPartner);
    const cardName = (id: string) => cardList.find(([entry]) => entry.cardid === id)?.[1].name ?? "Card";

    return (
        <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
            <header className="flex flex-wrap items-end justify-between gap-4 border-b border-base-content/15 pb-5">
                <div className="min-w-0">
                    <p className="text-sm font-bold uppercase text-primary"><Link href="/decks" className="link link-hover">Rumble / Decks</Link></p>
                    <h1 className="mt-1 break-words text-3xl font-bold">{deckName || "Untitled deck"}</h1>
                    <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`badge badge-soft ${deckLegality ? "badge-success" : "badge-error"}`}>{deckLegality ? "Legal" : "Not legal"}</span>
                        <span className="badge badge-ghost">{played ? `${gamesPlayed} ${gamesPlayed === 1 ? "game" : "games"} played` : "Not played yet"}</span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link href={`/deck/${deckInfo.id}`} className="btn btn-primary">View deck</Link>
                    <Link href={`/exportdeck/${deckInfo.id}`} className="btn">Export for TTS</Link>
                </div>
            </header>

            {!deckLegality && deckLegalityMessages.length > 0 && (
                <div role="alert" className="alert alert-error alert-soft mt-5 items-start">
                    <div>
                        <p className="font-semibold">This deck isn&apos;t legal</p>
                        <ul className="mt-1 list-disc pl-5 text-sm">
                            {deckLegalityMessages.map(mes => <li key={mes}>{mes}</li>)}
                        </ul>
                    </div>
                </div>
            )}
            {updateError && (
                <div role="alert" className="alert alert-warning alert-soft mt-5">
                    <span>Couldn&apos;t save that change. Try again.</span>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setUpdateError(false)}>Dismiss</button>
                </div>
            )}

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                <Panel title="Deck art" description="Pick a printing of your commander or partner.">
                    <figure className="aspect-[4/3] overflow-hidden rounded-box bg-base-200">
                        {deckInfo.image
                            ? <img src={deckInfo.image} alt={`${deckName} art`} className="h-full w-full object-contain" />
                            : <div className="grid h-full place-items-center text-base-content/60">No art selected</div>}
                    </figure>
                    {artOptions.length > 0 && (
                        <div className="grid max-h-96 grid-cols-2 gap-2 overflow-y-auto p-1 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                            {artOptions.map(p => {
                                const selected = p.artcrop === deckInfo.image;
                                return (
                                    <button
                                        key={p.artcrop}
                                        type="button"
                                        aria-pressed={selected}
                                        aria-label={`Use ${cardName(p.cardid)} art`}
                                        className={`overflow-hidden rounded-field ring-offset-2 ring-offset-base-100 transition hover:ring-2 hover:ring-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selected ? "ring-2 ring-primary" : ""}`}
                                        onClick={() => sendDeckUpdate("image", p.artcrop)}
                                    >
                                        <img src={p.artcrop} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </Panel>

                <div className="grid gap-6">
                    <Panel title="Setup">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Deck name</legend>
                            <input type="text" placeholder="Deck name" className="input input-lg w-full text-xl font-semibold" value={deckName} onChange={e => {setDeckName(e.target.value); changeDelay("name", e.target.value);}}/>
                        </fieldset>
                        <div className="rounded-box bg-base-200 p-4">
                            <h3 className="text-xs font-bold uppercase tracking-wide text-base-content/60">Command zone</h3>
                            <div className="mt-1 grid gap-x-4 sm:grid-cols-2">
                                <fieldset className="fieldset sm:col-span-2">
                                    <legend className="fieldset-legend">Commander</legend>
                                    <select className="select w-full" value={deckCommander ?? ""} onChange={e => sendDeckUpdate("commander", e.target.value)}>
                                        <option value="" disabled>Choose a commander</option>
                                        {commanderOptions.map(([entry, card]) => <option key={entry.cardid} value={entry.cardid}>{card.name}</option>)}
                                    </select>
                                </fieldset>
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Partner</legend>
                                    <select className="select w-full" value={deckPartner ?? ""} onChange={e => sendDeckUpdate("partner", e.target.value)}>
                                        <option value="">None</option>
                                        {partnerOptions.map(([entry, card]) => <option key={entry.cardid} value={entry.cardid}>{card.name}</option>)}
                                    </select>
                                </fieldset>
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Companion</legend>
                                    <select className="select w-full" value={deckCompanion ?? ""} onChange={e => sendDeckUpdate("companion", e.target.value)}>
                                        <option value="">None</option>
                                        {partnerOptions.map(([entry, card]) => <option key={entry.cardid} value={entry.cardid}>{card.name}</option>)}
                                    </select>
                                </fieldset>
                            </div>
                        </div>
                    </Panel>

                    <Panel title="Sideboard" description={played ? "Locked because this deck has been played." : undefined}>
                        <select className="select w-full" value="" disabled={played} aria-label="Add a card to the sideboard" onChange={e => sendDeckUpdate("sideboard", e.target.value)}>
                            <option value="" disabled>Add a card…</option>
                            {sideboardToAdd.map(([entry, card]) => <option key={entry.cardid} value={entry.cardid}>{card.name}</option>)}
                        </select>
                        <RemovableCards cards={sideboard} emptyText="No sideboard cards." disabled={played} removeLabel="from the sideboard" onRemove={id => sendDeckUpdate("-sideboard", id)} />
                    </Panel>

                    <Panel title="Custom cards" description={played ? "Locked because this deck has been played." : undefined}>
                        <select className="select w-full" value="" disabled={played} aria-label="Add a custom card" onChange={e => sendDeckUpdate("card", e.target.value)}>
                            <option value="" disabled>Add a card…</option>
                            {customToAdd.map(card => <option key={card.id} value={card.id}>{card.name}</option>)}
                        </select>
                        <RemovableCards cards={customInDeck} emptyText="No custom cards." disabled={played} removeLabel="from the deck" onRemove={id => sendDeckUpdate("-card", id)} />
                    </Panel>

                    {!played && (
                        <section className="card border border-error/30 bg-base-100">
                            <div className="card-body flex-row flex-wrap items-center justify-between gap-3 p-5">
                                <div>
                                    <h2 className="font-semibold">Delete deck</h2>
                                    <p className="text-sm text-base-content/70">Only decks that haven&apos;t been played can be deleted.</p>
                                </div>
                                {confirmDelete ? (
                                    <div className="flex gap-2">
                                        <button type="button" className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
                                        <button type="button" className="btn btn-error" onClick={deleteDeck}>Confirm delete</button>
                                    </div>
                                ) : (
                                    <button type="button" className="btn btn-error btn-outline" onClick={() => setConfirmDelete(true)}>Delete deck</button>
                                )}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </main>
    );
}

function Panel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
    return (
        <section className="card bg-base-100 shadow-sm">
            <div className="card-body gap-4 p-5 sm:p-6">
                <div>
                    <h2 className="card-title text-lg">{title}</h2>
                    {description && <p className="text-sm text-base-content/70">{description}</p>}
                </div>
                {children}
            </div>
        </section>
    );
}

function RemovableCards({ cards, emptyText, disabled, removeLabel, onRemove }: { cards: CardListItem[]; emptyText: string; disabled: boolean; removeLabel: string; onRemove: (id: string) => void }) {
    if (cards.length === 0) return <p className="text-sm text-base-content/60">{emptyText}</p>;
    return (
        <ul className="grid gap-2 sm:grid-cols-2">
            {cards.map(([entry, card]) => (
                <li key={entry.cardid} className="flex items-center justify-between gap-2 rounded-field bg-base-200 py-1 pl-3 pr-1">
                    <span className="truncate">{card.name}</span>
                    <button type="button" className="btn btn-ghost btn-square btn-sm text-error" disabled={disabled} aria-label={`Remove ${card.name} ${removeLabel}`} onClick={() => onRemove(entry.cardid)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true"><path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /></svg>
                    </button>
                </li>
            ))}
        </ul>
    );
}
