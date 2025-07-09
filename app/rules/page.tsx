export default function Rules() {
    return (
        <div className="flex-col justify-start items-center min-h-screen bg-base-200 mx-auto max-w-6xl">
            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                <article className="prose">
                    <h1>Deck Requirements and Restrictions</h1>
                    <li>60 card deck</li>
                    <li>A commander - part of the 60 card deck but starts the game in the command zone - commanders can be: one legendary creature, planeswalker, vehicle, or Spacecraft. Two Legendary Creatures with partner. Or the other similar effects made for commanders, i.e. Background, Friends Forever, Doctors Companion</li>
                    <li>All cards in the deck must be in the color identity of your commander(s)</li>
                    <li>One copy of any card, except basic lands</li>
                    <li>Decks may not contain any copies of cards on the banlist (see below)</li>
                    <li>Decks may also have sideboards of up to 7 cards</li> </article>
                </div>
            </div>
            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                <article className="prose">
                    <h1>Basic Game Rules</h1>
                    <li>2+ players</li>
                    <li>Free for all</li>
                    <li>All players start the game with 20 life</li>
                    <li>All commanders start the game in the command zone</li>
                    <li>The last player left standing wins the game</li>
                </article>
                </div>
            </div>
            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                <article className="prose">
                    <h1>Important Things to Note</h1>
                    <li>Rule 0: If your playgroup wants to use different rules you have our explicit permission right here to do so (as long as your friends agree!).</li>
                    <li>Command Damage: There is no “commander damage” like in the Commander format.</li>
                    <li>Signature Spells: There are no “signature spells” like in the Oathbreaker format.</li>
                    <li>Color Identity: A cards color identity can come from any part of that card, including its casting cost and any mana symbols in its text. Every card in your deck must only use mana symbols that also appear on your commander. Mana symbols included in reminder text, like extort, are not technically part of the card and are therefore excluded in the cards color identity. Basic lands are included in this rule, you may only use basic lands that are part of your commander’s color identity in your deck.</li>
                    <li>Command Zone: The command zone is where your commander resides during the game when they are not in play. At the start of the game, each player puts their commander face up into the command zone, typically towards the center of the play area. A commander can be cast from the command zone for its normal costs, plus an additional two generic mana for each previous time its been cast from the command zone this game. If your commander is put into your library, hand, graveyard or exile from anywhere, you may return it to your command zone.</li>
                    <li>Mulligans: BB follows the same mulligan rules as other multiplayer formats. Each player gets one free mulligan, followed by the standard London Mulligan. Each player draws a card on their first turn of the game.</li>
                </article>
                </div>
            </div>
        </div>
    );
}