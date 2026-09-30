import type { Metadata } from "next";
import { fetchPublic } from "../../util/publicApi";
import { openGraph } from "../../util/siteMetadata";

type DeckSummary = { deck: { name: string } };

// Fetched without a token, so private decks get the API's guest name (commander + date).
export async function generateMetadata({ params }: { params: Promise<{ deckid: string }> }): Promise<Metadata> {
    const { deckid } = await params;
    const data = await fetchPublic<DeckSummary>(`/decklist/${encodeURIComponent(deckid)}`, 600);
    if (!data) return { title: "Deck" };
    return {
        title: data.deck.name,
        openGraph: openGraph(`${data.deck.name} | Rumble deck`, "A Rumble deck: 60-card singleton, 20 life, one commander."),
    };
}

export default function DeckLayout({ children }: { children: React.ReactNode }) {
    return children;
}
