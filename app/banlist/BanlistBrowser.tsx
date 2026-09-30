'use client'
import { useState } from "react";
import { CardPreviewRow, CategoryHeading, ManaSymbols, StatusIcon } from "../components/CardList";

export type ListedCard = { id?: string; name: string; cost?: string; cardimage?: string };

const scryfallUrl = (card: ListedCard) => card.id
    ? `https://scryfall.com/search?q=oracleid=${card.id}`
    : `https://scryfall.com/search?q=${encodeURIComponent(`!"${card.name}"`)}`;

export default function BanlistBrowser({ banned, watchlist }: { banned: ListedCard[]; watchlist: ListedCard[] }) {
    const [search, setSearch] = useState("");
    const term = search.trim().toLowerCase();
    const filter = (cards: ListedCard[]) => (term ? cards.filter(card => card.name.toLowerCase().includes(term)) : cards);
    const bannedMatches = filter(banned);
    const watchMatches = filter(watchlist);

    return (
        <div className="space-y-8">
            <label className="input w-full sm:w-96">
                <span className="label">Search</span>
                <input type="search" placeholder="Card name" value={search} onChange={e => setSearch(e.target.value)} />
            </label>

            {watchlist.length > 0 && (
                <section aria-labelledby="watchlist-heading">
                    <SectionHeading id="watchlist-heading" title="Watchlist" shown={watchMatches.length} total={watchlist.length} search={search} />
                    <p className="mb-2 max-w-3xl text-base-content/70">
                        Cards we&apos;ve noticed can have a big impact on games or might be banworthy. They&apos;re highlighted to encourage discussion and to keep an eye on their effect on the format.
                    </p>
                    <div className="columns-1 gap-3 md:columns-2 xl:columns-3">
                        {watchMatches.map(card => <CardRow key={card.id ?? card.name} card={card} status="watchlist" />)}
                    </div>
                    {watchMatches.length === 0 && <NoMatches search={search} />}
                </section>
            )}

            <section aria-labelledby="banned-heading">
                <SectionHeading id="banned-heading" title="Banned" shown={bannedMatches.length} total={banned.length} search={search} />
                <div className="columns-1 gap-3 md:columns-2 xl:columns-3">
                    {groupByLetter(bannedMatches).map(([letter, cards]) => (
                        <div key={letter} className="contents">
                            <CategoryHeading label={letter} count={cards.length} />
                            {cards.map(card => <CardRow key={card.id ?? card.name} card={card} status="banned" />)}
                        </div>
                    ))}
                </div>
                {bannedMatches.length === 0 && <NoMatches search={search} />}
            </section>
        </div>
    );
}

function groupByLetter(cards: ListedCard[]) {
    const groups = new Map<string, ListedCard[]>();
    for (const card of [...cards].sort((a, b) => a.name.localeCompare(b.name))) {
        const letter = /[a-z]/i.test(card.name[0]) ? card.name[0].toUpperCase() : "#";
        groups.set(letter, [...(groups.get(letter) ?? []), card]);
    }
    return [...groups];
}

function SectionHeading({ id, title, shown, total, search }: { id: string; title: string; shown: number; total: number; search: string }) {
    return (
        <h2 id={id} className="mb-2 flex items-center gap-2 text-xl font-bold">
            {title}
            <span className="font-mono text-sm font-normal text-base-content/50">{search ? `${shown} of ${total}` : total}</span>
        </h2>
    );
}

function NoMatches({ search }: { search: string }) {
    return <p className="text-base-content/60">No cards match &ldquo;{search}&rdquo;.</p>;
}

function CardRow({ card, status }: { card: ListedCard; status: "banned" | "watchlist" }) {
    return (
        <CardPreviewRow image={card.cardimage} name={card.name}>
            <article className="flex min-h-9 w-full items-center gap-1.5 overflow-hidden rounded-md border border-base-300 border-l-2 border-l-transparent bg-base-100 px-2 py-1 transition-colors hover:border-primary/50 hover:bg-base-200">
                <a
                    className="min-w-0 flex-1 truncate text-sm font-medium leading-snug hover:text-primary hover:underline"
                    href={scryfallUrl(card)}
                    target="_blank"
                    rel="noreferrer"
                    title={card.name}
                >
                    {card.name.split("//")[0].trim()}
                </a>
                <div className="flex shrink-0 items-center gap-1">
                    {status === "watchlist"
                        ? <StatusIcon src="/star-svgrepo-com.svg" label="On watchlist" color="bg-warning" />
                        : <StatusIcon src="/alert-svgrepo.svg" label="Banned card" color="bg-error" />}
                </div>
                <ManaSymbols cost={card.cost} />
            </article>
        </CardPreviewRow>
    );
}
