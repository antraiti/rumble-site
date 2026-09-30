'use client'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import Cookies from "js-cookie";

const DECK_COOKIE = "hidedecknames";
const PLAYER_COOKIE = "hideplayernames";

type DeckLike = { name?: string | null; lastupdated?: string | null };
type Commanders = (string | null | undefined)[];
type DemoMode = {
    hideDeckNames: boolean;
    hidePlayerNames: boolean;
    setHideDeckNames: (hidden: boolean) => void;
    setHidePlayerNames: (hidden: boolean) => void;
};

const DemoModeContext = createContext<DemoMode>({ hideDeckNames: false, hidePlayerNames: false, setHideDeckNames: () => {}, setHidePlayerNames: () => {} });

export function DemoModeProvider({ children }: { children: ReactNode }) {
    const [hideDeckNames, setDeckState] = useState(false);
    const [hidePlayerNames, setPlayerState] = useState(false);

    useEffect(() => {
        // cookie-derived values are unavailable during SSR; set after mount to avoid hydration mismatch
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDeckState(Cookies.get(DECK_COOKIE) === "true");
        setPlayerState(Cookies.get(PLAYER_COOKIE) === "true");
    }, []);

    const persist = (cookie: string, setState: (value: boolean) => void) => (value: boolean) => {
        Cookies.set(cookie, String(value), { expires: 365 });
        setState(value);
    };

    return (
        <DemoModeContext.Provider value={{ hideDeckNames, hidePlayerNames, setHideDeckNames: persist(DECK_COOKIE, setDeckState), setHidePlayerNames: persist(PLAYER_COOKIE, setPlayerState) }}>
            {children}
        </DemoModeContext.Provider>
    );
}

export const useDemoMode = () => useContext(DemoModeContext);

// Mirrors the API's guest name ("Commander & Partner - Sep 30, 2026") so both read the same.
function anonymousParts(deck: DeckLike, commanders: Commanders) {
    const names = commanders.filter((name): name is string => !!name);
    const date = deck.lastupdated
        ? new Date(deck.lastupdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
        : "";
    return { title: names.length ? names.join(" & ") : "Untitled deck", date };
}

/** Returns a formatter giving the deck's name, or its commanders and date while deck names are hidden. */
export function useDeckName() {
    const { hideDeckNames } = useDemoMode();
    return useCallback((deck: DeckLike, commanders: Commanders) => {
        if (!hideDeckNames) return deck.name || "Untitled deck";
        const { title, date } = anonymousParts(deck, commanders);
        return date ? `${title} - ${date}` : title;
    }, [hideDeckNames]);
}

/** Deck name for headings; while names are hidden the date is shown as muted secondary text. */
export function DeckName({ deck, commanders }: { deck: DeckLike; commanders: Commanders }) {
    const { hideDeckNames } = useDemoMode();
    if (!hideDeckNames) return <>{deck.name || "Untitled deck"}</>;
    const { title, date } = anonymousParts(deck, commanders);
    return <>{title}{date && <span className="ml-2 text-[0.6em] font-normal not-italic text-base-content/60">{date}</span>}</>;
}

/** Returns a formatter giving a player's username, or "Player <id>" while player names are hidden. */
export function usePlayerName() {
    const { hidePlayerNames } = useDemoMode();
    return useCallback((id: number | string | null | undefined, name: string | null | undefined) =>
        hidePlayerNames ? (id != null ? `Player ${id}` : "Player") : (name ?? ""), [hidePlayerNames]);
}

export function PlayerName({ id, name }: { id: number | string | null | undefined; name: string | null | undefined }) {
    return <>{usePlayerName()(id, name)}</>;
}
