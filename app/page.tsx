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
            <a href="/quickstart"><button className="btn btn-primary w-full">Quick Start</button></a>
            <a href="/starterdecks"><button className="btn btn-primary w-full">Starter Decks</button></a>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 grid-cols-1 gap-5 mx-auto place-items-center max-w-5xl">
        <IcoCard num={60} descript={`Card Singleton Decks`} image={`/diamonds-card-svgrepo-com.svg`}/>
        <IcoCard num={20} descript={`Starting Life Total`} image={`/broken-heart-svgrepo-com.svg`}/>
        <IcoCard num={1} descript={`Legendary Creature or Planeswalker`} image={`/crown-svgrepo-com.svg`}/>
            
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

const IcoCard = (props: any) => {
  return (
    <div className="card bg-base-100 shadow-xl p-2 w-72 h-52">
      <figure className="">
        <img src={props.image} className="rounded-xl brightness-0 invert h-28 w-28" />
        <h1 className="card-title text-center self-center text-7xl pl-5">{`${props.num}`}</h1>
      </figure>
      <div className="card-body">
        <div><h2 className="text-center text-xl">{`${props.descript}`}</h2></div>
      </div>
    </div>)
}
