import Image from 'next/image'
import Link from 'next/link'
import RumbleCardFan from './components/RumbleCardFan'

const formatRules = [
  { value: '60', label: 'card singleton decks', image: '/diamonds-card-svgrepo-com.svg' },
  { value: '20', label: 'starting life', image: '/broken-heart-svgrepo-com.svg' },
  { value: '1', label: 'legendary creature or planeswalker', image: '/crown-svgrepo-com.svg' },
]

export default function Home() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-linear-to-b from-base-200 via-base-100 to-base-200">
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 md:min-h-[26rem] md:grid-cols-[1fr_auto] md:gap-16 md:py-20">
        <div className="max-w-2xl">
          <h1 className="text-6xl font-black leading-none sm:text-7xl">Rumble</h1>
          <p className="mt-5 max-w-xl text-lg text-base-content/75 sm:text-xl">
            Rumble is a multiplayer Magic format with 60-card singleton decks, 20 starting life, and a legendary creature or planeswalker leading your deck.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/quickstart" className="btn btn-primary">Quick start</Link>
            <Link href="/starterdecks" className="btn btn-outline">Browse starter decks</Link>
          </div>
        </div>
        <div className="mx-auto md:mx-0">
          <RumbleCardFan priority />
        </div>
      </section>

      <section aria-label="Rumble format at a glance" className="mx-auto grid max-w-7xl grid-cols-1 border-y border-base-content/15 px-5 sm:grid-cols-3 sm:px-8">
        {formatRules.map((rule) => (
          <div key={rule.label} className="flex items-center gap-4 border-base-content/15 py-5 sm:justify-center sm:border-r sm:px-6 sm:py-7 last:border-0">
            <span
              aria-hidden="true"
              className="size-10 shrink-0 bg-base-content"
              style={{
                maskImage: `url('${rule.image}')`,
                WebkitMaskImage: `url('${rule.image}')`,
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
              }}
            />
            <div>
              <p className="text-3xl font-black leading-none">{rule.value}</p>
              <p className="mt-1 text-sm capitalize text-base-content/70">{rule.label}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-12 sm:px-8 md:grid-cols-[12rem_1fr] md:gap-12 md:py-16">
        <h2 className="text-2xl font-bold sm:text-3xl">Why Rumble?</h2>
        <p className="max-w-3xl text-base leading-7 text-base-content/80">
          Smaller decks reward focused building, open room for strategies like mill, and keep costs down. A tighter ban list reins in explosive fast-mana starts without diminishing the value of ramp, while a lower life total keeps games moving and gives combat decks space to shine.
        </p>
      </section>
    </main>
  )
}
