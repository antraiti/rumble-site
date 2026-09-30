'use client'
import { useEffect, useRef, type CSSProperties, type ReactNode, type Ref } from "react";

const STEPS = 48;
const PSEUDO_ELEMENTS = [undefined, "::before", "::after"];

// daisyUI spins the aura at a constant angle, which races round corners on wide boxes.
// These keyframes take even steps along the edge instead, so the highlight moves at a steady speed.
function steadyKeyframes(width: number, height: number): Keyframe[] {
    const hw = width / 2, hh = height / 2;
    const corners = [[0, -hh], [hw, -hh], [hw, hh], [-hw, hh], [-hw, -hh], [0, -hh]];
    const perimeter = 2 * (width + height);
    const frames: Keyframe[] = [];
    let previous = 0;
    for (let step = 0; step <= STEPS; step++) {
        let remaining = (step / STEPS) * perimeter;
        let [x, y] = corners[0];
        for (let i = 1; i < corners.length; i++) {
            const [ax, ay] = corners[i - 1], [bx, by] = corners[i];
            const length = Math.hypot(bx - ax, by - ay);
            if (remaining <= length || i === corners.length - 1) {
                const t = length ? Math.min(remaining / length, 1) : 0;
                [x, y] = [ax + (bx - ax) * t, ay + (by - ay) * t];
                break;
            }
            remaining -= length;
        }
        let angle = (Math.atan2(x, -y) * 180) / Math.PI;
        while (angle < previous) angle += 360;
        previous = angle;
        frames.push({ offset: step / STEPS, "--aura-angle": `${angle}deg`, transform: "translateZ(1px)" });
    }
    return frames;
}

type SteadyAuraProps = {
    as?: "div" | "article";
    className?: string;
    style?: CSSProperties;
    /** Only animate while hovered or keyboard-focused. */
    hoverOnly?: boolean;
    children: ReactNode;
};

/** A daisyUI `aura` whose highlight travels the edge at a constant speed. */
export default function SteadyAura({ as: Tag = "div", className = "", style, hoverOnly = false, children }: SteadyAuraProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const duration = matchMedia("(prefers-reduced-motion: reduce)").matches ? 24000 : 6000;
        const frames = () => steadyKeyframes(element.offsetWidth, element.offsetHeight);
        const initial = frames();
        const animations = PSEUDO_ELEMENTS.map(pseudoElement => element.animate(initial, { duration, iterations: Infinity, pseudoElement }));
        element.style.animation = "none";

        const resize = new ResizeObserver(() => {
            const next = frames();
            animations.forEach(animation => (animation.effect as KeyframeEffect).setKeyframes(next));
        });
        resize.observe(element);

        let hovered = false, focused = false;
        const sync = () => animations.forEach(animation => (hovered || focused ? animation.play() : animation.pause()));
        const listeners: [string, () => void][] = [
            ["pointerenter", () => { hovered = true; sync(); }],
            ["pointerleave", () => { hovered = false; sync(); }],
            ["focusin", () => { focused = element.matches(":has(:focus-visible)"); sync(); }],
            ["focusout", () => { focused = false; sync(); }],
        ];
        if (hoverOnly) {
            listeners.forEach(([type, listener]) => element.addEventListener(type, listener));
            sync();
        }

        return () => {
            listeners.forEach(([type, listener]) => element.removeEventListener(type, listener));
            resize.disconnect();
            animations.forEach(animation => animation.cancel());
            element.style.animation = "";
        };
    }, [hoverOnly]);

    return <Tag ref={ref as Ref<HTMLDivElement>} className={`aura ${className}`} style={style}>{children}</Tag>;
}
