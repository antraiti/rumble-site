import Link from "next/link"

export default function StatsLayout ({
  children,
}: {
    children: React.ReactNode
  }) {
  return (
    <section className="flex mx-auto max-w-6xl p-5">
      <div>
        <ul className="menu bg-secondary rounded-box mr-5 w-16">
          <div className="tooltip" data-tip="Your Stats">
            <li>
                <Link className="w-full" href="/stats">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                </Link>
            </li>
          </div>
          <div className="tooltip" data-tip="Global Stats">
            <li>
                <Link className="w-full" href="/stats/global">
                  <img className="h-5 w-5" src="../globe.svg"></img>
                </Link>
            </li>
          </div>
          <div className="tooltip" data-tip="Card Stats">
            <li>
                <Link className="w-full" href="/stats/cards">
                  <img className="w-full" src="../card-view.svg"></img>
                </Link>
            </li>
          </div>
          <div className="tooltip" data-tip="Watchlist Stats">
            <li>
                <Link className="w-full" href="/stats/watchlist">
                  <img className="h-5 w-5" src="../eye.svg"></img>
                </Link>
            </li>
          </div>
        </ul>
      </div>
      {children}
    </section>
  )
}
