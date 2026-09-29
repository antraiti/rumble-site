'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";

const StatsOptions = createContext({ includeThemed: false });
export const useStatsOptions = () => useContext(StatsOptions);

const tabs = [
  { href: "/stats", label: "My stats" },
  { href: "/stats/global", label: "Global" },
  { href: "/stats/cards", label: "Cards" },
  { href: "/stats/watchlist", label: "Watchlist" },
  { href: "/stats/users", label: "Players" },
];

export default function StatsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [includeThemed, setIncludeThemed] = useState(false);
  const supportsThemed = pathname === "/stats" || pathname === "/stats/global" || /^\/stats\/users\/[^/]+$/.test(pathname);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-base-content/15 pb-5">
        <div>
          <p className="text-sm font-bold uppercase text-primary">Rumble / Stats</p>
          <h1 className="mt-1 text-3xl font-bold">Stats</h1>
        </div>
        {supportsThemed && (
          <label className="label cursor-pointer gap-3">
            <span className="text-base">Include themed events</span>
            <input type="checkbox" className="toggle toggle-primary" checked={includeThemed} onChange={e => setIncludeThemed(e.target.checked)} />
          </label>
        )}
      </header>
      <nav role="tablist" aria-label="Stats sections" className="tabs tabs-border tabs-lg mt-4 overflow-x-auto flex-nowrap">
        {tabs.map(tab => {
          const active = tab.href === "/stats" ? pathname === "/stats" : pathname.startsWith(tab.href);
          return (
            <Link key={tab.href} href={tab.href} role="tab" aria-selected={active} className={`tab whitespace-nowrap ${active ? "tab-active" : ""}`}>
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <StatsOptions.Provider value={{ includeThemed }}>
        <div className="pt-6">{children}</div>
      </StatsOptions.Provider>
    </main>
  );
}
