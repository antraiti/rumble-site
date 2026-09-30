import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import type { Color } from "../types";
import { FALLBACK_IMAGE, identityAura, identityColors } from "../decks/DeckCard";
import CopyDecklistButton from "./CopyDecklistButton";
import PageHeader from "../components/PageHeader";
import { fetchPublic } from "../util/publicApi";
import { openGraph } from "../util/siteMetadata";

export const revalidate = 600;

export const metadata: Metadata = {
    title: "Starter decks",
    description: "Ready-to-play Rumble decks. Browse the lists, export to Tabletop Simulator, or copy them into your deck builder.",
    openGraph: openGraph("Rumble starter decks", "Ready-to-play Rumble decks for new players."),
};

// The curated list (order, taglines, tags) lives in the API so guest deck-name hiding can exempt the same decks.
type StarterDeck = { id: number; tagline: string; tags: string[] };

type DecklistEntry = { cardid: string; count: number; issideboard: boolean };
type DecklistCard = { id: string; name: string };
type DecklistResponse = {
    deck: { id: number; name: string; image: string; identityid: number; commander: string | null; partner: string | null };
    cardlist: [DecklistEntry, DecklistCard][] | null;
};

function summarize({ deck, cardlist }: DecklistResponse) {
    const main = (cardlist ?? []).filter(([entry]) => !entry.issideboard);
    const leaderIds = [deck.commander, deck.partner];
    const leaders = leaderIds
        .map(id => main.find(([, card]) => card.id === id)?.[1].name)
        .filter((name): name is string => !!name);
    const listText = [...main]
        .sort(([, a], [, b]) => Number(leaderIds.includes(b.id)) - Number(leaderIds.includes(a.id)) || a.name.localeCompare(b.name))
        .map(([entry, card]) => `${entry.count} ${card.name}`)
        .join("\n");
    return { leaders, listText };
}

export default async function StarterDecks() {
    const [colors, starters] = await Promise.all([
        fetchPublic<Color[]>("/colors", 600),
        fetchPublic<StarterDeck[]>("/starterdecks", 600),
    ]);
    const decks = await Promise.all((starters ?? []).map(async starter => ({ starter, data: await fetchPublic<DecklistResponse>(`/decklist/${starter.id}`, 600) })));

    return (
        <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
            <PageHeader
                eyebrow="Rumble / Starter decks"
                title="Pick a deck and play"
                actions={<>
                    <Link href="/quickstart" className="btn btn-primary">New here? Quick start</Link>
                    <Link href="/rules" className="btn btn-outline">Rules</Link>
                </>}
            >
                Ready-to-play Rumble decks. Look through the list, export it to Tabletop Simulator, or copy it into your favourite deck builder.
            </PageHeader>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {!starters && (
                    <div role="alert" className="alert alert-warning alert-soft lg:col-span-2">
                        Starter decks couldn&apos;t be loaded right now. Try again later.
                    </div>
                )}
                {decks.map(({ starter, data }) => data
                    ? <StarterDeckCard key={starter.id} data={data} tagline={starter.tagline} tags={starter.tags} color={colors?.find(color => color.id === data.deck.identityid)} />
                    : (
                        <div key={starter.id} role="alert" className="alert alert-warning alert-soft">
                            This starter deck couldn&apos;t be loaded right now. Try again later.
                        </div>
                    ))}
            </div>
        </main>
    );
}

function StarterDeckCard({ data, tagline, tags, color }: { data: DecklistResponse; tagline: string; tags: string[]; color?: Color }) {
    const { deck } = data;
    const summary = summarize(data);
    const pips = color ? ([["W", "White"], ["U", "Blue"], ["B", "Black"], ["R", "Red"], ["G", "Green"]] as const).filter((_, index) => [color.white, color.blue, color.black, color.red, color.green][index]) : [];
    const tints = color ? identityColors(color) : ["var(--color-primary)"];
    const stripe = tints.length > 1 ? `linear-gradient(90deg, ${tints.join(", ")})` : tints[0];
    // One soft glow per color, spread along the bottom edge.
    const glow = tints.map((tint, index) => {
        const x = tints.length === 1 ? 100 : (index / (tints.length - 1)) * 100;
        return `radial-gradient(circle at ${x}% 100%, color-mix(in oklab, ${tint} 22%, transparent), transparent 60%)`;
    }).join(", ");

    return (
        <article
            className="aura block h-full [background-image:none] not-hover:[animation:none] hover:[background-image:var(--deck-aura)] has-focus-visible:[background-image:var(--deck-aura)]"
            style={{ "--deck-aura": color ? identityAura(color) : undefined } as CSSProperties}
        >
            <div className="card relative h-full overflow-hidden bg-base-100 shadow-md">
                <div aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-1.5" style={{ background: stripe }} />
                <figure className="relative aspect-[16/9]">
                    <img src={deck.image || FALLBACK_IMAGE} alt="" className="h-full w-full object-cover" />
                    <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-base-100 via-base-100/20 to-transparent" />
                    {color && (
                        <div className="absolute left-4 top-4 flex gap-1 rounded-full bg-base-100/85 px-2 py-1 shadow-sm backdrop-blur" aria-label={`Colors: ${pips.map(([, label]) => label).join(", ") || "Colorless"}`}>
                            {(pips.length ? pips.map(([symbol]) => symbol) : ["C"]).map(symbol => <img key={symbol} src={`/${symbol}.svg`} alt="" className="size-5" />)}
                        </div>
                    )}
                </figure>
                <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: glow }} />

                <div className="card-body relative -mt-14 gap-4">
                    <div>
                        <h2 className="text-3xl font-black leading-tight">{deck.name}</h2>
                        {summary.leaders.length > 0 && <p className="mt-1 text-base-content/70">Led by {summary.leaders.join(" & ")}</p>}
                    </div>
                    <p className="text-lg">{tagline}</p>
                    <ul className="flex flex-wrap gap-2" aria-label="Play style">
                        {tags.map((tag, index) => {
                            const tint = tints[index % tints.length];
                            return (
                                <li
                                    key={tag}
                                    className="badge border font-semibold"
                                    style={{ borderColor: `color-mix(in oklab, ${tint} 70%, transparent)`, backgroundColor: `color-mix(in oklab, ${tint} 18%, transparent)` }}
                                >
                                    {tag}
                                </li>
                            );
                        })}
                    </ul>

                    <div className="card-actions mt-auto flex-wrap">
                        <Link href={`/deck/${deck.id}`} className="btn" style={{ "--btn-color": tints[0], "--btn-fg": "oklch(20% 0 0)" } as CSSProperties}>View decklist</Link>
                        <Link href={`/exportdeck/${deck.id}`} className="btn">Export for TTS</Link>
                        <CopyDecklistButton text={summary.listText} />
                    </div>
                </div>
            </div>
        </article>
    );
}