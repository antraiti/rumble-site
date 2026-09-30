import type { Metadata } from "next";
import { openGraph } from "../../util/siteMetadata";

export const metadata: Metadata = {
    title: "Deck check",
    description: "Paste a decklist to check it against the Rumble deck rules and banlist.",
    openGraph: openGraph("Rumble deck check", "Check a decklist against the Rumble deck rules and banlist."),
};

export default function CheckerLayout({ children }: { children: React.ReactNode }) {
    return children;
}
