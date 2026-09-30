'use client'
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import userData from "../../util/UserData"
import { apiGet, apiPost } from "../../util/apiClient";
import PageHeader from "../../components/PageHeader";
import SteadyAura from "../../components/SteadyAura";
import { usePlayerName } from "../../components/DemoMode";
import { decklistFromUrl } from "../../util/deckImport";
import { getShowDeckOwner } from "../../util/adminPrefs";
import type { User } from "../../types";

type NewDeckBody = { user: number; list: string; name: string };

export default function NewDeck() {
    const router = useRouter();
    const { userToken, userId, isAdmin } = userData();
    const playerName = usePlayerName();
    const [users, setUsers] = useState<User[]>([]);
    const [deckUser, setDeckUser] = useState<number>();
    const [deckName, setDeckName] = useState("");
    const [deckList, setDeckList] = useState("");
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [source, setSource] = useState<"list" | "manafoundry">("list");
    const [deckUrl, setDeckUrl] = useState("");
    const [urlMessage, setUrlMessage] = useState("");
    const [loadedCount, setLoadedCount] = useState<number | null>(null);
    const [showOwner, setShowOwner] = useState(false);

    useEffect(() => {
        // localStorage is unavailable during SSR; read after mount to avoid hydration mismatch
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowOwner(getShowDeckOwner());
    }, []);

    useEffect(() => {
        if (!isAdmin || !showOwner || !userToken) return;
        apiGet<User[]>("users", { token: userToken }).then(setUsers).catch(() => setUsers([]));
    }, [isAdmin, showOwner, userToken]);

    async function loadFromUrl() {
        setUrlMessage("");
        try {
            const list = await decklistFromUrl(deckUrl);
            setDeckList(list);
            setLoadedCount(list.split("\n").reduce((total, line) => total + (parseInt(line) || 0), 0));
            setDeckUrl("");
            setSource("list");
        } catch (error) {
            setUrlMessage(error instanceof Error ? error.message : "Couldn't read that link.");
        }
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setErrorMessage("");
        try {
            const owner = isAdmin && showOwner ? deckUser ?? userId : userId;
            const body: NewDeckBody = { user: Number(owner), list: deckList, name: deckName.trim() };
            await apiPost<{ deckid?: number }>("deck", { token: userToken, body });
            router.push("/decks");
        } catch (error) {
            setErrorMessage(error instanceof Error && error.message ? error.message : "Something went wrong.");
            setSaving(false);
        }
    }

    if (!userToken) {
        return (
            <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
                <PageHeader eyebrow="Rumble / Decks" title="New deck">Sign in to add a deck.</PageHeader>
            </main>
        );
    }

    const canCreate = !saving && !!deckName.trim() && !!deckList.trim();

    return (
        <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
            <PageHeader eyebrow="Rumble / Decks" title="New deck" actions={<Link href="/decks/checker" className="btn btn-outline">Check a list first</Link>} />

            <form className="mt-8 space-y-6" onSubmit={submit}>
                {isAdmin && showOwner && users.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3 rounded-box border border-warning/40 bg-warning/5 p-4">
                        <span className="badge badge-warning">Admin</span>
                        <label className="select flex-1">
                            <span className="label">Owner</span>
                            <select value={deckUser ?? userId ?? ""} onChange={e => setDeckUser(Number(e.target.value))} disabled={saving}>
                                {users.map(user => <option key={user.id} value={user.id}>{playerName(user.id, user.username)}</option>)}
                            </select>
                        </label>
                    </div>
                )}

                <Step title="Name your deck">
                    <input type="text" className="input w-full" aria-label="Deck name" placeholder="Goblin Mayhem" maxLength={64} value={deckName} onChange={e => setDeckName(e.target.value)} disabled={saving} required />
                </Step>

                <Step title="Add your cards">
                    <div role="tablist" className="tabs tabs-box">
                        <button type="button" role="tab" aria-selected={source === "list"} className={`tab flex-1 ${source === "list" ? "tab-active" : ""}`} onClick={() => setSource("list")} disabled={saving}>Paste a decklist</button>
                        <button type="button" role="tab" aria-selected={source === "manafoundry"} className={`tab flex-1 ${source === "manafoundry" ? "tab-active" : ""}`} onClick={() => setSource("manafoundry")} disabled={saving}>ManaFoundry link</button>
                    </div>

                    {source === "list" ? (
                        <div role="tabpanel" className="flex flex-col gap-3">
                            {loadedCount !== null && (
                                <div role="status" className="alert alert-success alert-soft">
                                    Loaded {loadedCount} cards from ManaFoundry. Check the list, then create the deck.
                                </div>
                            )}
                            <textarea className="textarea h-96 w-full font-mono text-sm" aria-label="Decklist" placeholder={"1 Krenko, Mob Boss *CMDR*\n1 Goblin Guide\n20 Mountain\n...\n\nSideboard\n1 Pyroblast"} value={deckList} onChange={e => { setDeckList(e.target.value); setLoadedCount(null); }} disabled={saving} required />
                            <p className="text-base-content/70">
                                Mark your commander with <code>*CMDR*</code>. Put sideboard cards under a <code>Sideboard</code> heading.
                            </p>
                        </div>
                    ) : (
                        <div role="tabpanel" className="flex flex-col gap-3">
                            <div className="join w-full">
                                <input type="url" className="input join-item w-full" aria-label="ManaFoundry share link" placeholder="https://manafoundry.gg/decks/shared#d=…" value={deckUrl} onChange={e => setDeckUrl(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); loadFromUrl(); } }} disabled={saving} />
                                <button type="button" className="btn btn-primary join-item" onClick={loadFromUrl} disabled={saving || !deckUrl.trim()}>Load deck</button>
                            </div>
                            {urlMessage && <div role="alert" className="alert alert-warning alert-soft">{urlMessage}</div>}
                            <p className="text-base-content/70">
                                Use the <strong>Share</strong> link from ManaFoundry. Saved deck links only work in your own browser.
                            </p>
                        </div>
                    )}
                </Step>

                {errorMessage && (
                    <div role="alert" className="alert alert-error alert-soft">
                        <span><span className="font-semibold">Couldn&apos;t create the deck.</span> {errorMessage}</span>
                    </div>
                )}
                <div className="flex flex-wrap items-center justify-end gap-4">
                    {saving && <span className="text-base-content/70" role="status">Looking up cards. New cards can take a moment.</span>}
                    {canCreate ? (
                        <SteadyAura className="text-success">
                            <button type="submit" className="btn btn-success btn-lg">Create deck</button>
                        </SteadyAura>
                    ) : (
                        <button type="submit" className="btn btn-success btn-lg" disabled>
                            {saving && <span className="loading loading-spinner" aria-hidden="true" />}
                            {saving ? "Creating…" : "Create deck"}
                        </button>
                    )}
                </div>
            </form>
        </main>
    );
}

function Step({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="card bg-base-100 shadow-sm">
            <div className="card-body gap-4">
                <h2 className="card-title text-xl">{title}</h2>
                {children}
            </div>
        </section>
    );
}
