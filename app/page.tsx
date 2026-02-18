export default function Home() {
  return (
    <div className="h-screen bg-linear-to-b from-base-200 to-base-300">
      <div className="hero md:h-72 h-56"
      >
        <div className="hero-content text-center">
          <img src="/newlogo.svg" className="h-32 w-32 mb-5"/>
          <div className="max-w-md">
            <h1 className="text-7xl font-bold">Rumble</h1>
            <p className="py-6">The Alternative Multiplayer Format</p>
          </div>
          <div className="flex flex-col gap-5">
            <a href="/quickstart"><button className="btn btn-soft w-full">Quick Start</button></a>
            <a href="/starterdecks"><button className="btn btn-soft w-full">Starter Decks</button></a>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 grid-cols-1 gap-5 mx-auto place-items-center max-w-5xl">
        <IcoCard num={60} descript={`Card Singleton Decks`} image={`/diamonds-card-svgrepo-com.svg`} bgcolor={`bg-linear-to-br from-blue-300/50 to-blue-400/50`}/>
        <IcoCard num={20} descript={`Starting Life Total`} image={`/broken-heart-svgrepo-com.svg`} bgcolor={`bg-linear-to-br from-red-300/50 to-red-400/50`}/>
        <IcoCard num={1} descript={`Legendary Creature or Planeswalker`} image={`/crown-svgrepo-com.svg`} bgcolor={`bg-linear-to-br from-amber-200/50 to-amber-300/50`}/>
      </div>
        <div className="w-full mt-16">
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
    <div className="card bg-base-100 shadow-xl p-0 w-72 h-24">
      <div className="flex h-full items-center">
        <div className={`card flex flex-col items-center justify-between h-full ${props.bgcolor} p-2`}>
          <img src={props.image} className="rounded-xl brightness-0 invert h-12 w-12" />
          <h1 className="card-title text-center self-center text-3xl">{`${props.num}`}</h1>
        </div>
          <h2 className="text-center text-xl w-full">{`${props.descript}`}</h2>
      </div>
    </div>)
}
