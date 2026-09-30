import type { Metadata } from "next";
import PageHeader from "../components/PageHeader";
import { fetchPublic } from "../util/publicApi";
import { openGraph } from "../util/siteMetadata";
import BanlistBrowser, { type ListedCard } from "./BanlistBrowser";
import { FALLBACK_BANLIST } from "./fallbackBanlist";

export const revalidate = 60;

export const metadata: Metadata = {
    title: "Banlist",
    description: "Cards banned in Rumble, plus the watchlist of cards under review.",
    openGraph: openGraph("Rumble banlist", "Cards banned in Rumble, plus the watchlist of cards under review."),
};

const alsoBanned = [
    { label: "Silver-bordered cards", href: "https://scryfall.com/search?as=full&q=border%3Asilver" },
    { label: "Acorn cards", href: "https://scryfall.com/search?q=stamp%3Aacorn&unique=cards&as=grid&order=name" },
    { label: "Conspiracies", href: "https://scryfall.com/search?as=grid&order=name&q=type%3Aconspiracy" },
    { label: "Cards that reference \u201cplaying for ante\u201d", href: "https://scryfall.com/search?as=grid&order=name&q=oracle%3A%22playing+for+ante%22" },
];

export default async function Banlist() {
    const [banned, watchlist] = await Promise.all([
        fetchPublic<ListedCard[]>("/banlist", 60),
        fetchPublic<ListedCard[]>("/watchlist", 60),
    ]);

    return (
        <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
            <PageHeader eyebrow="Rumble / Banlist" title="Banned & watchlisted cards">
                We approach banning from a few angles. Coming from other formats, you&apos;ll notice that many fast mana and high-priced cards are banned.
            </PageHeader>

            <section aria-labelledby="also-banned-heading" className="mt-8 rounded-box bg-base-100 p-5 shadow-sm">
                <h2 id="also-banned-heading" className="font-bold">Also banned</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                    {alsoBanned.map(item => (
                        <li key={item.label}>
                            <a href={item.href} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">{item.label} ↗</a>
                        </li>
                    ))}
                </ul>
            </section>

            {!banned && (
                <div role="alert" className="alert alert-warning alert-soft mt-6">
                    Couldn&apos;t reach the card database, so this is a saved copy of the banlist and may be out of date.
                </div>
            )}

            <div className="mt-8">
                <BanlistBrowser banned={banned ?? FALLBACK_BANLIST.map(name => ({ name }))} watchlist={watchlist ?? []} />
            </div>
        </main>
    );
}
