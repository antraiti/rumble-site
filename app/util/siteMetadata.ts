import type { Metadata } from "next";

export const OG_IMAGE = { url: "/og-image", width: 1200, height: 630, alt: "Rumble: a multiplayer Magic: The Gathering format" };

// Child pages replace the parent's openGraph object entirely, so each page builds a full one here.
export function openGraph(title: string, description: string): NonNullable<Metadata["openGraph"]> {
    return { siteName: "Rumble MTG", type: "website", title, description, images: [OG_IMAGE] };
}
