import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import PageHeader from "../components/PageHeader";
import { openGraph } from "../util/siteMetadata";

export const metadata: Metadata = {
    title: "Quick start",
    description: "New to Rumble? The three numbers that matter and how Rumble differs from Commander/EDH.",
    openGraph: openGraph("Rumble quick start", "How Rumble differs from Commander/EDH, in a minute."),
};

const differences: { stat: string; title: string; body: ReactNode; accent: string }[] = [
    { stat: "60", title: "Card singleton decks", body: "One copy of each card, except basic lands.", accent: "bg-info" },
    { stat: "20", title: "Starting life", body: "Every player starts at 20 life, not 40.", accent: "bg-success" },
    { stat: "0", title: "Commander damage", body: "There is no commander damage. Win by any other means.", accent: "bg-error" },
];

const notes: { title: string; body: ReactNode }[] = [
    { title: "Your commander", body: "Any legendary creature or planeswalker that isn't banned." },
    { title: "Check the banlist", body: <>Some EDH staples, like Sol Ring, are banned. See the <Link href="/banlist" className="link link-primary">banlist</Link>.</> },
    { title: "Companions", body: "Allowed, but your deck and your commander must meet the companion's requirement, and the companion must fit your commander's color identity." },
];

export default function Quickstart() {
    return (
        <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
            <PageHeader eyebrow="Rumble / Quick start" title="Rumble for EDH players">
                Already play Commander? Here&apos;s everything that&apos;s different.
            </PageHeader>

            <section aria-label="Key numbers" className="mt-8 grid gap-4 sm:grid-cols-3">
                {differences.map(item => (
                    <div key={item.title} className="relative overflow-hidden rounded-box bg-base-100 p-6 pt-7 shadow-sm">
                        <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${item.accent}`} />
                        <div className="text-6xl font-black leading-none">{item.stat}</div>
                        <h2 className="mt-2 text-xl font-bold">{item.title}</h2>
                        <p className="mt-1 text-base-content/70">{item.body}</p>
                    </div>
                ))}
            </section>

            <section aria-label="Good to know" className="mt-6 grid gap-4 md:grid-cols-3">
                {notes.map(note => (
                    <div key={note.title} className="rounded-box bg-base-100 p-6 shadow-sm">
                        <h2 className="text-lg font-bold">{note.title}</h2>
                        <p className="mt-1 text-base-content/70">{note.body}</p>
                    </div>
                ))}
            </section>

            <section className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-box bg-base-100 p-6 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold">Ready to play?</h2>
                    <p className="text-base-content/70">Grab a starter deck, or read the full rules first.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link href="/starterdecks" className="btn btn-primary">Starter decks</Link>
                    <Link href="/rules" className="btn">Full rules</Link>
                </div>
            </section>
        </main>
    );
}