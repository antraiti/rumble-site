export default function Home() {
  return (
    <div>
      <div className="hero h-56 bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-7xl font-bold">Rumble</h1>
            <p className="py-6">The Alternative Multiplayer Format</p>
          </div>
        </div>
      </div>
      <div className="flex gap-5 mx-auto justify-center">
          <div className="card w-72 bg-base-100 shadow-xl">
            <figure className="px-10 pt-10">
              <img src="/images/blank-playing-cards.png" className="rounded-xl brightness-0 invert h-28" />
            </figure>
            <div className="card-body">
              <h2 className="card-title text-center self-center">60 Card Singleton Decks</h2>
            </div>
          </div>
          <div className="card w-72 bg-base-100 shadow-xl">
            <figure className="px-10 pt-10">
              <img src="/images/heart-outline.png" className="rounded-xl brightness-0 invert h-28" />
            </figure>
            <div className="card-body">
              <h2 className="card-title text-center self-center">20 Starting Life Total</h2>
            </div>
          </div>
          <div className="card w-72 bg-base-100 shadow-xl">
            <figure className="px-10 pt-10">
              <img src="/images/dragon-icon.png" className="rounded-xl brightness-0 invert h-28" />
            </figure>
            <div className="card-body">
              <h2 className="card-title text-center self-center">1 Legendary Creature/Planeswalker as your Commander</h2>
            </div>
          </div>
        </div>
    </div>
  )
}
