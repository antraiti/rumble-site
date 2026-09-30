import Link from "next/link";
import type { CSSProperties } from "react";
import type { Color, DeckCommander, DeckInfo } from "../types";
import { DeckName, useDeckName, useDemoMode } from "../components/DemoMode";
import SteadyAura from "../components/SteadyAura";

export const FALLBACK_IMAGE = 'https://cards.scryfall.io/art_crop/front/0/e/0eb0e8e7-266f-441e-b1cd-12b8ec3f7d71.jpg'; // Imp's Mischief UwU

// aura values are Tailwind's amber-300, sky-400, red-400, green-400, gray-400.
const pips: { key: "red" | "blue" | "white" | "green" | "black"; label: string; icon: string; bg: string; aura: string }[] = [
    { key: "red", label: "Red", icon: "/R.svg", bg: "bg-red-300", aura: "oklch(70.4% 0.191 22.216)" },
    { key: "blue", label: "Blue", icon: "/U.svg", bg: "bg-sky-200", aura: "oklch(74.6% 0.16 232.661)" },
    { key: "white", label: "White", icon: "/W.svg", bg: "bg-amber-100", aura: "oklch(87.9% 0.169 91.605)" },
    { key: "green", label: "Green", icon: "/G.svg", bg: "bg-green-300", aura: "oklch(79.2% 0.209 151.711)" },
    { key: "black", label: "Black", icon: "/B.svg", bg: "bg-gray-400", aura: "oklch(70.7% 0.022 261.325)" },
];
const COLORLESS_AURA = "oklch(92.8% 0.006 264.531)";

function auraGradient(colors: string[]) {
    if (colors.length === 0) colors = ["var(--color-primary)"];
    const start = colors.length === 1 ? 225 : 150;
    return `conic-gradient(from var(--aura-angle), transparent ${start}deg, ${colors.join(", ")})`;
}

export function identityColors(identity: Pick<Color, "white" | "blue" | "black" | "red" | "green">) {
    const colors = pips.filter(pip => identity[pip.key]).map(pip => pip.aura);
    return colors.length ? colors : [COLORLESS_AURA];
}

export function identityAura(identity: Pick<Color, "white" | "blue" | "black" | "red" | "green">) {
    return auraGradient(identityColors(identity));
}

export interface DeckStats {
    games: number;
    wins: number;
    placementTotal: number;
    placed: number;
}

export interface DeckSummary {
    deck: DeckInfo;
    commander?: DeckCommander | null;
    partner?: DeckCommander | null;
    companion?: DeckCommander | null;
    color?: Color;
    stats: DeckStats;
}

export default function DeckCard({ summary, colors = [] }: { summary: DeckSummary; colors?: Color[] }) {
    const { deck, commander, partner, companion, color, stats } = summary;
    const colorPips = color ? pips.filter(pip => color[pip.key]) : [];
    const colorless = color?.name === "colorless";
    const colorLabel = colorless ? "Colorless" : colorPips.map(pip => pip.label).join(", ");
    const leaders = [commander, partner].filter((card): card is DeckCommander => !!card?.name);
    const companionName = companion?.name;
    const identityOf = (card?: DeckCommander | null) => colors.find(item => item.id === card?.identityid);
    const { hideDeckNames: namesHidden } = useDemoMode();
    const deckName = useDeckName();
    const leaderNames = leaders.map(card => card.name);

    const aura = auraGradient(colorless ? [COLORLESS_AURA] : colorPips.map(pip => pip.aura));

    return (
        <SteadyAura
            hoverOnly
            className="block h-full [background-image:none] hover:[background-image:var(--deck-aura)] has-focus-visible:[background-image:var(--deck-aura)]"
            style={{ "--deck-aura": aura } as CSSProperties}
        >
        <Link
            href={`/deckdetails/${deck.id}`}
            className="card card-side h-full min-h-40 overflow-hidden bg-base-100 shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
            <figure className="w-28 shrink-0 sm:w-40">
                <img src={deck.image || FALLBACK_IMAGE} alt="" className="h-full w-full object-cover" />
            </figure>
            <div className="flex w-5 shrink-0 flex-col bg-base-300" role="img" aria-label={colorLabel ? `Colors: ${colorLabel}` : "Colors unknown"}>
                {colorPips.map(pip => (
                    <div key={pip.key} className={`flex flex-1 items-center justify-center ${pip.bg}`}>
                        <img src={pip.icon} alt="" className="size-4" />
                    </div>
                ))}
                {colorless && <div className="flex flex-1 items-center justify-center bg-gray-200"><img src="/C.svg" alt="" className="size-4" /></div>}
            </div>
            <div className="card-body min-w-0 gap-3 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                    <h2 className="card-title block min-w-0 truncate text-lg" title={deckName(deck, leaderNames)}><DeckName deck={deck} commanders={leaderNames} /></h2>
                    {!deck.islegal && <span className="badge badge-error badge-soft shrink-0">Not legal</span>}
                </div>
                {(leaders.length > 0 && !namesHidden) || companionName ? (
                    <ul className="flex flex-wrap gap-1.5" aria-label="Commanders and companion">
                        {!namesHidden && leaders.map((card, index) => (
                            <RoleTag key={card.id} role={index === 0 ? "Commander" : "Partner"} name={card.name} identity={identityOf(card)} style="badge-neutral" />
                        ))}
                        {companionName && <RoleTag role="Companion" name={companionName} identity={identityOf(companion)} style="badge-outline" />}
                    </ul>
                ) : null}
                <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-base-content/10 pt-3 text-center">
                    <div>
                        <dt className="text-sm text-base-content/60">Games</dt>
                        <dd className="text-xl font-bold">{stats.games}</dd>
                    </div>
                    <div>
                        <dt className="text-sm text-base-content/60">Win rate</dt>
                        <dd className="text-xl font-bold">{stats.games ? `${((stats.wins / stats.games) * 100).toFixed(1)}%` : "—"}</dd>
                    </div>
                    <div>
                        <dt className="text-sm text-base-content/60">Avg. place</dt>
                        <dd className="text-xl font-bold">{stats.placed ? (stats.placementTotal / stats.placed).toFixed(2) : "—"}</dd>
                    </div>
                </dl>
            </div>
        </Link>
        </SteadyAura>
    );
}

const WUBRG = [["white", "W"], ["blue", "U"], ["black", "B"], ["red", "R"], ["green", "G"]] as const;

function RoleTag({ role, name, identity, style }: { role: string; name: string; identity?: Color; style: string }) {
    const symbols: string[] = identity ? WUBRG.filter(([key]) => identity[key]).map(([, symbol]) => symbol) : [];
    if (identity && symbols.length === 0) symbols.push("C");
    return (
        <li className={`badge ${style} max-w-full gap-1.5 font-medium`} title={`${role}: ${name}`}>
            {symbols.length > 0 && (
                <span className="flex shrink-0 gap-0.5" aria-hidden="true">
                    {symbols.map(symbol => <img key={symbol} src={`/${symbol}.svg`} alt="" className="size-4" />)}
                </span>
            )}
            <span className="min-w-0 truncate">{name}</span>
        </li>
    );
}
