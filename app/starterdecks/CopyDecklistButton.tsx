'use client'
import { useState } from "react";

export default function CopyDecklistButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    async function copy() {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    }

    return (
        <button type="button" className="btn btn-ghost" onClick={copy} aria-live="polite">
            {copied ? "Copied!" : "Copy list"}
        </button>
    );
}
