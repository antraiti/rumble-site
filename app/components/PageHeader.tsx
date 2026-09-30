import type { ReactNode } from "react";

export default function PageHeader({ eyebrow, title, children, actions }: { eyebrow: string; title: ReactNode; children?: ReactNode; actions?: ReactNode }) {
    return (
        <header className="border-b border-base-content/15 pb-6">
            <p className="text-sm font-bold uppercase text-primary">{eyebrow}</p>
            <h1 className="mt-1 text-4xl font-black">{title}</h1>
            {children && <div className="mt-3 max-w-2xl text-lg text-base-content/70">{children}</div>}
            {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
        </header>
    );
}
