const MANAFOUNDRY_HOSTS = ["manafoundry.gg", "20q2.github.io"];

function base64UrlToBytes(value: string): Uint8Array {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    return Uint8Array.from(atob(base64), char => char.charCodeAt(0));
}

// Format spec: https://manafoundry.gg/developers ("version.base64url", body = commander, partner, one card name per copy).
async function decodeManaFoundry(fragment: string): Promise<string> {
    const dot = fragment.indexOf(".");
    const version = fragment.slice(0, dot);
    let bytes: Uint8Array;
    try {
        bytes = base64UrlToBytes(fragment.slice(dot + 1));
        if (version === "1") {
            const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
            bytes = new Uint8Array(await new Response(stream).arrayBuffer());
        } else if (version !== "0") {
            throw new Error();
        }
    } catch {
        throw new Error("That ManaFoundry link couldn't be read. Try copying the share link again.");
    }

    const [commander = "", partner = "", ...cards] = new TextDecoder().decode(bytes).split("\n").map(line => line.trim());
    const counts = new Map<string, number>();
    for (const card of cards.filter(Boolean)) counts.set(card, (counts.get(card) ?? 0) + 1);

    const lines: string[] = [];
    for (const name of [commander, partner].filter(Boolean)) {
        lines.push(`1 ${name} *CMDR*`);
        const remaining = (counts.get(name) ?? 0) - 1;
        if (remaining > 0) counts.set(name, remaining);
        else counts.delete(name);
    }
    for (const [name, count] of counts) lines.push(`${count} ${name}`);
    if (lines.length === 0) throw new Error("That ManaFoundry link doesn't contain any cards.");
    return lines.join("\n");
}

/** Turns a deck link into decklist text. Throws with a user-facing message when the link can't be read. */
export async function decklistFromUrl(input: string): Promise<string> {
    let url: URL;
    try {
        url = new URL(input.trim());
    } catch {
        throw new Error("That doesn't look like a link.");
    }
    const host = url.hostname.replace(/^www\./, "");

    if (MANAFOUNDRY_HOSTS.includes(host)) {
        const fragment = new URLSearchParams(url.hash.slice(1)).get("d");
        if (fragment) return decodeManaFoundry(fragment);
        throw new Error("ManaFoundry keeps saved decks in your browser, so we can't open that link. Open the deck on ManaFoundry and use Share to copy a link instead.");
    }
    if (host === "moxfield.com") {
        throw new Error("Moxfield doesn't let other sites read its decks. Use Moxfield's Export option to copy the list as text, then paste it as a decklist.");
    }
    if (host === "deckstats.net") {
        throw new Error("Deckstats doesn't let other sites read its decks. Use Deckstats' Export option to copy the list as text, then paste it as a decklist.");
    }
    throw new Error("Only ManaFoundry share links work here. For other sites, export the list and paste it as a decklist.");
}
