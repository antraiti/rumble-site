import type { Metadata } from "next"
import StatsShell from "./_components/StatsShell"

export const metadata: Metadata = { title: "Stats" }

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return <StatsShell>{children}</StatsShell>
}
