'use client'
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import userData from "../../util/UserData"
import { apiGet, apiPost } from "../../util/apiClient";
import PageHeader from "../../components/PageHeader";
import { usePlayerName } from "../../components/DemoMode";
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

    useEffect(() => {
        if (!isAdmin || !userToken) return;
        apiGet<User[]>("users", { token: userToken }).then(setUsers).catch(() => setUsers([]));
    }, [isAdmin, userToken]);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setErrorMessage("");
        try {
            const body: NewDeckBody = { user: Number(deckUser ?? userId), list: deckList, name: deckName.trim() || "New Deck" };
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

    return (
        <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
            <PageHeader eyebrow="Rumble / Decks" title="New deck" actions={<Link href="/decks/checker" className="btn btn-outline">Check a list first</Link>}>
                Paste a decklist from your deck builder. Mark your commander with <code>*CMDR*</code> and put sideboard cards under a <code>Sideboard</code> heading.
            </PageHeader>

            <form className="card mt-8 bg-base-100 shadow-sm" onSubmit={submit}>
                <div className="card-body gap-4">
                    {isAdmin && users.length > 0 && (
                        <label className="select w-full">
                            <span className="label">Owner</span>
                            <select value={deckUser ?? userId ?? ""} onChange={e => setDeckUser(Number(e.target.value))} disabled={saving}>
                                {users.map(user => <option key={user.id} value={user.id}>{playerName(user.id, user.username)}</option>)}
                            </select>
                        </label>
                    )}
                    <label className="floating-label">
                        <span>Deck name</span>
                        <input type="text" className="input w-full" placeholder="Deck name" maxLength={64} value={deckName} onChange={e => setDeckName(e.target.value)} disabled={saving} />
                    </label>
                    <label className="floating-label">
                        <span>Decklist</span>
                        <textarea className="textarea h-96 w-full font-mono text-sm" placeholder={"1 Krenko, Mob Boss *CMDR*\n1 Goblin Guide\n20 Mountain\n...\n\nSideboard\n1 Pyroblast"} value={deckList} onChange={e => setDeckList(e.target.value)} disabled={saving} required />
                    </label>
                    {errorMessage && (
                        <div role="alert" className="alert alert-error alert-soft">
                            <span><span className="font-semibold">Couldn&apos;t create the deck.</span> {errorMessage}</span>
                        </div>
                    )}
                    <div className="flex flex-wrap items-center gap-3">
                        <button type="submit" className="btn btn-primary" disabled={saving || !deckList.trim()}>
                            {saving && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
                            {saving ? "Importing…" : "Create deck"}
                        </button>
                        {saving && <span className="text-sm text-base-content/70" role="status">Looking up cards. New cards can take a moment.</span>}
                    </div>
                </div>
            </form>
        </main>
    );
}
