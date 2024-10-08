export default function Home() {
  return (
    <div>
      <div className="hero h-56 bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-7xl font-bold">Rumble</h1>
            <p className="py-6">The Alternative Multiplayer Format</p>
          </div>
          <div className="flex flex-col gap-5">
            <button className="btn btn-secondary">Quick Start</button>
            <button className="btn btn-secondary">Starter Decks</button>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 grid-cols-1 gap-5 mx-auto place-items-center max-w-5xl">
          <div className="join-card w-72 h-72 bg-base-100 shadow-xl">
            <figure className="px-10 pt-10">
              <img src="/images/blank-playing-cards.png" className="rounded-xl brightness-0 invert h-28" />
            </figure>
            <div className="card-body">
              <h2 className="card-title text-center self-center">60 Card Singleton Decks</h2>
            </div>
          </div>
          <div className="card w-72 h-72 bg-base-100 shadow-xl">
            <figure className="px-10 pt-10">
              <img src="/images/heart-outline.png" className="rounded-xl brightness-0 invert h-28" />
            </figure>
            <div className="card-body">
              <h2 className="card-title text-center self-center">20 Starting Life Total</h2>
            </div>
          </div>
          <div className="card w-72 h-72 bg-base-100 shadow-xl">
            <figure className="px-10 pt-10">
              <img src="/images/dragon-icon.png" className="rounded-xl brightness-0 invert h-28" />
            </figure>
            <div className="card-body">
              <h2 className="card-title text-center self-center">1 Legendary Creature/Planeswalker as your Commander</h2>
            </div>
          </div>
        </div>
        <div className="w-full mt-10">
          <div className="card bg-base-100 shadow-xl max-w-xl mx-auto">
            <div className="card-body">
            <article className="prose">
                <h1>Why Rumble?</h1>
                <p>After many years of EDH and trying other independent formats we formed Rumble to create a more diverse and versatile format. 
                  The smaller deck sizes force more focused deckbuilding decisions while enabling archetypes like mill and overall making play costs cheaper. 
                  The stricter bans on fast mana remove explosive starts and help keep decks on more equal footing, while also preserving the value of ramp cards. 
                  The smaller life total keeps games streamlined while enabling aggro and combat decks.
                  </p>
            </article>
            </div>
          </div>
        </div>
    </div>
  )
}
