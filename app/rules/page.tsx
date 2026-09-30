import Link from "next/link";
import type { ReactNode } from "react";
import PageHeader from "../components/PageHeader";

const deckRules: ReactNode[] = [
    "60 card deck.",
    "A commander. It is part of the 60 card deck but starts the game in the command zone. Commanders can be one legendary creature, planeswalker, vehicle, or Spacecraft; two legendary creatures with partner; or the other similar effects made for commanders, such as Background, Friends Forever, and Doctor's Companion.",
    "All cards in the deck must be in the color identity of your commander(s).",
    "One copy of any card, except basic lands.",
    <>Decks may not contain any copies of cards on the <Link href="/banlist" className="link link-primary">banlist</Link>.</>,
    "Decks may also have sideboards of up to 7 cards.",
];

const gameRules = [
    "2+ players.",
    "Free for all.",
    "All players start the game with 20 life.",
    "All commanders start the game in the command zone.",
    "The last player left standing wins the game.",
];

const notes: { term: string; body: string }[] = [
    { term: "Rule 0", body: "If your playgroup wants to use different rules, you have our explicit permission right here to do so (as long as your friends agree!)." },
    { term: "Commander damage", body: "There is no \u201ccommander damage\u201d like in the Commander format." },
    { term: "Signature spells", body: "There are no \u201csignature spells\u201d like in the Oathbreaker format." },
    { term: "Color identity", body: "A card's color identity can come from any part of that card, including its casting cost and any mana symbols in its text. Every card in your deck must only use mana symbols that also appear on your commander. Mana symbols included in reminder text, like extort, are not technically part of the card and are therefore excluded from the card's color identity. Basic lands are included in this rule: you may only use basic lands that are part of your commander's color identity." },
    { term: "Command zone", body: "The command zone is where your commander resides during the game when it is not in play. At the start of the game, each player puts their commander face up into the command zone, typically towards the center of the play area. A commander can be cast from the command zone for its normal costs, plus an additional two generic mana for each previous time it's been cast from the command zone this game. If your commander is put into your library, hand, graveyard or exile from anywhere, you may return it to your command zone." },
    { term: "Mulligans", body: "Rumble follows the same mulligan rules as other multiplayer formats. Each player gets one free mulligan, followed by the standard London Mulligan. Each player draws a card on their first turn of the game." },
];

const sections = [
    { id: "deck", title: "Deck requirements" },
    { id: "game", title: "Basic game rules" },
    { id: "notes", title: "Things to note" },
];

export default function Rules() {
    return (
        <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
            <PageHeader eyebrow="Rumble / Rules" title="Rules" actions={<Link href="/quickstart" className="btn btn-outline">Coming from EDH? Quick start</Link>}>
                Everything you need to build a legal deck and play a game of Rumble.
            </PageHeader>

            <div className="mt-8 grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
                <nav aria-label="On this page" className="hidden lg:block">
                    <div className="sticky top-6">
                        <p className="text-sm font-bold uppercase text-base-content/60">On this page</p>
                        <ul className="menu mt-2 w-full p-0">
                            {sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}
                        </ul>
                    </div>
                </nav>

                <div className="space-y-6">
                    <RuleSection id="deck" title="Deck requirements">
                        <NumberedList items={deckRules} />
                    </RuleSection>
                    <RuleSection id="game" title="Basic game rules">
                        <NumberedList items={gameRules} />
                    </RuleSection>
                    <RuleSection id="notes" title="Things to note">
                        <dl className="divide-y divide-base-content/10">
                            {notes.map(note => (
                                <div key={note.term} className="grid gap-1 py-4 first:pt-0 last:pb-0 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-6">
                                    <dt className="font-bold">{note.term}</dt>
                                    <dd className="text-base-content/80">{note.body}</dd>
                                </div>
                            ))}
                        </dl>
                    </RuleSection>
                </div>
            </div>
        </main>
    );
}

function RuleSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
    return (
        <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-6 rounded-box bg-base-100 p-6 shadow-sm sm:p-8">
            <h2 id={`${id}-heading`} className="mb-5 text-2xl font-bold">{title}</h2>
            {children}
        </section>
    );
}

function NumberedList({ items }: { items: ReactNode[] }) {
    return (
        <ol className="space-y-3">
            {items.map((item, index) => (
                <li key={index} className="flex gap-4">
                    <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-info/15 font-bold text-info">{index + 1}</span>
                    <span className="pt-1 text-base-content/85">{item}</span>
                </li>
            ))}
        </ol>
    );
}
