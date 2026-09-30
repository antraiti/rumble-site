'use client'
import { useState, type ReactNode } from "react";

export function getManaSymbolUrl(symbol: string) {
    const fileName = symbol === "∞" ? "INFINITY" : symbol === "½" ? "HALF" : symbol.replaceAll("/", "");
    return `https://svgs.scryfall.io/card-symbols/${fileName}.svg`;
}

export function StatusIcon({ src, label, color }: { src: string; label: string; color: string }) {
    return <span
        role="img"
        aria-label={label}
        title={label}
        className={`size-4 shrink-0 ${color}`}
        style={{
            maskImage: `url('${src}')`,
            WebkitMaskImage: `url('${src}')`,
            maskPosition: "center",
            WebkitMaskPosition: "center",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskSize: "contain",
            WebkitMaskSize: "contain",
        }}
    />;
}

export function ManaSymbols({ cost }: { cost?: string }) {
    const symbols = cost?.match(/\{([^}]+)\}/g)?.map(symbol => symbol.slice(1, -1)) ?? [];
    return (
        <div className="flex shrink-0 items-center gap-0.5" aria-label={cost ? `Mana cost ${cost}` : "No mana cost"}>
            {symbols.map((symbol, index) => (
                <img key={`${symbol}-${index}`} src={getManaSymbolUrl(symbol)} alt={`{${symbol}}`} title={`{${symbol}}`} className="size-[18px]" loading="lazy" />
            ))}
        </div>
    );
}

const PREVIEW_HEIGHT = 420;

// Mounts the card image on first hover/focus so a list doesn't download every card image up front.
export function CardPreviewRow({ image, name, children }: { image?: string; name: string; children: ReactNode }) {
    const [showPreview, setShowPreview] = useState(false);
    const [below, setBelow] = useState(false);
    const [failed, setFailed] = useState(false);
    const reveal = (event: { currentTarget: HTMLElement }) => {
        setBelow(event.currentTarget.getBoundingClientRect().top < PREVIEW_HEIGHT + 16);
        setShowPreview(true);
    };
    const src = image || `https://api.scryfall.com/cards/named?format=image&version=normal&exact=${encodeURIComponent(name)}`;
    return (
        <div className={`tooltip mb-1 w-full break-inside-avoid ${below ? "tooltip-bottom" : "tooltip-top"}`} onMouseEnter={reveal} onFocus={reveal}>
            {showPreview && !failed && <div className="tooltip-content z-50 bg-transparent p-0 shadow-none">
                <img className="w-72 max-w-none rounded-[4.75%/3.5%] shadow-2xl" src={src} alt={`${name} card art`} onError={() => setFailed(true)} />
            </div>}
            {children}
        </div>
    );
}

export function CategoryHeading({ label, count }: { label: string; count: number }) {
    return <h2 className="mb-1 mt-3 flex items-center gap-2 border-b border-base-content/15 pb-1 text-xs font-bold uppercase text-base-content/70">
        <span>{label}</span>
        <span className="font-mono text-[11px] text-base-content/45">{count}</span>
    </h2>;
}
