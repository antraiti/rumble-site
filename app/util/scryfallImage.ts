'use client'
import { useEffect, useState } from "react";

// Scryfall asks for at most ~10 API requests/second; stay well under it and back off after failures.
const SPACING_MS = 250;
const ERROR_BACKOFF_MS = 30_000;

let nextSlot = 0;
const requested = new Set<string>();

const namedImageUrl = (name: string) =>
    `https://api.scryfall.com/cards/named?format=image&version=normal&exact=${encodeURIComponent(name)}`;

function reserveDelay() {
    const now = Date.now();
    const at = Math.max(now, nextSlot);
    nextSlot = at + SPACING_MS;
    return at - now;
}

/** Call from an <img> onError for a fallback URL; pauses all further Scryfall lookups. */
export function reportScryfallImageError() {
    nextSlot = Math.max(nextSlot, Date.now() + ERROR_BACKOFF_MS);
}

/** Returns a Scryfall API image URL for `name`, released through a shared rate limiter. */
export function useScryfallFallbackImage(name: string, enabled: boolean): string | undefined {
    const [released, setReleased] = useState<string | null>(null);
    useEffect(() => {
        // Already fetched once this session, so the browser cache serves it.
        if (!enabled || requested.has(name)) return;
        const timer = window.setTimeout(() => {
            requested.add(name);
            setReleased(name);
        }, reserveDelay());
        return () => window.clearTimeout(timer);
    }, [name, enabled]);
    return enabled && (released === name || requested.has(name)) ? namedImageUrl(name) : undefined;
}
