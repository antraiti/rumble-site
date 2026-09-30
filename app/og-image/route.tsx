import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { OG_IMAGE } from "../util/siteMetadata";

export const dynamic = "force-static";

const facts = [
    ["60", "card singleton decks"],
    ["20", "starting life"],
    ["1", "legendary commander"],
];

// Shared link-preview image, referenced from page metadata via OG_IMAGE.
export async function GET() {
    const logo = await readFile(join(process.cwd(), "public", "newlogo.svg"));
    const logoSrc = `data:image/svg+xml;base64,${logo.toString("base64")}`;

    return new ImageResponse(
        (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, color: "white", background: "linear-gradient(135deg, #1d1b2e 0%, #3b1f4a 55%, #7a2e2e 100%)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoSrc} width={140} height={140} alt="" />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div style={{ fontSize: 120, fontWeight: 800, lineHeight: 1 }}>Rumble</div>
                        <div style={{ fontSize: 36, opacity: 0.8, marginTop: 12 }}>A multiplayer Magic: The Gathering format</div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 48 }}>
                    {facts.map(([value, label]) => (
                        <div key={label} style={{ display: "flex", flexDirection: "column", borderTop: "4px solid rgba(255,255,255,0.35)", paddingTop: 16, minWidth: 280 }}>
                            <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1 }}>{value}</div>
                            <div style={{ fontSize: 30, opacity: 0.8 }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>
        ),
        { width: OG_IMAGE.width, height: OG_IMAGE.height },
    );
}
