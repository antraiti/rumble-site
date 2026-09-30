'use client'

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { apiPost } from "../../util/apiClient";
import PageHeader from "../../components/PageHeader";

type CheckResult = {
    bannedCards: { id: string; name: string }[];
    unknown: string[];
    commanders: string[];
    legality: { legal: boolean; messages: string[] };
};

export default function Checker() {
    const [deckList, setDeckList] = useState("");
    const [result, setResult] = useState<CheckResult | null>(null);
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState("");

    async function checkDecklist(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setChecking(true);
        setError("");
        try {
            setResult(await apiPost<CheckResult>("deck/checker", { body: deckList }));
        } catch (err) {
            setResult(null);
            setError(err instanceof Error && err.message ? err.message : "Couldn't check that list.");
        } finally {
            setChecking(false);
        }
    }

    // Banned cards already appear in the legality messages as their own list below.
    const otherIssues = result?.legality.messages.filter(message => !message.startsWith("Contains banned card")) ?? [];

    return (
        <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">
            <PageHeader eyebrow="Rumble / Decks" title="Deck check" actions={<Link href="/rules" className="btn btn-outline">Deck rules</Link>}>
                Paste a decklist to check it against the Rumble deck rules: one or two legendary commanders, exactly 60 cards including them (80 with Yorion as companion), one copy of each card except basic lands, every card in your commanders&apos; color identity, up to 7 sideboard cards (a companion uses one), and nothing from the banlist. Rulebreaker commanders relax these where their text says so.
            </PageHeader>

            <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <form className="card bg-base-100 shadow-sm" onSubmit={checkDecklist}>
                    <div className="card-body gap-4">
                        <label className="floating-label">
                            <span>Decklist</span>
                            <textarea className="textarea h-96 w-full font-mono text-sm" placeholder={"1 Krenko, Mob Boss *CMDR*\n1 Goblin Guide\n20 Mountain\n...\n\nSideboard\n1 Pyroblast"} value={deckList} onChange={e => setDeckList(e.target.value)} required />
                        </label>
                        <p className="text-sm text-base-content/70">Mark your commander with <code>*CMDR*</code> or put it under a <code>Commander</code> heading.</p>
                        <button type="submit" className="btn btn-primary self-start" disabled={checking || !deckList.trim()}>
                            {checking && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
                            {checking ? "Checking…" : "Check deck"}
                        </button>
                    </div>
                </form>

                <section aria-live="polite" aria-label="Check results" className="space-y-4">
                    {error && <div role="alert" className="alert alert-error alert-soft">{error}</div>}
                    {!result && !error && (
                        <div className="rounded-box border border-dashed border-base-content/20 px-6 py-12 text-center text-base-content/60">
                            Results show up here.
                        </div>
                    )}
                    {result && (
                        <>
                            <div role="status" className={`alert ${result.legality.legal ? "alert-success" : "alert-error"} alert-soft`}>
                                <span className="text-lg font-semibold">{result.legality.legal ? "This deck is legal." : "This deck isn't legal yet."}</span>
                            </div>
                            {result.commanders.length > 0 && (
                                <ResultList title={`Commander${result.commanders.length > 1 ? "s" : ""}`} items={result.commanders} />
                            )}
                            {otherIssues.length > 0 && <ResultList title="Issues" items={otherIssues} tone="error" />}
                            {result.bannedCards.length > 0 && <ResultList title="Banned cards" items={result.bannedCards.map(card => card.name)} tone="error" />}
                            {result.unknown.length > 0 && (
                                <ResultList
                                    title="Cards we don't recognise"
                                    description="Check the spelling. Brand-new cards are fine: they're looked up when you create the deck."
                                    items={result.unknown}
                                    tone="warning"
                                />
                            )}
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}

function ResultList({ title, description, items, tone }: { title: string; description?: string; items: string[]; tone?: "error" | "warning" }) {
    const marker = tone === "error" ? "marker:text-error" : tone === "warning" ? "marker:text-warning" : "";
    return (
        <div className="card bg-base-100 shadow-sm">
            <div className="card-body gap-2 p-5">
                <h2 className="font-semibold">{title}</h2>
                {description && <p className="text-sm text-base-content/70">{description}</p>}
                <ul className={`list-disc pl-5 ${marker}`}>
                    {items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}
                </ul>
            </div>
        </div>
    );
}