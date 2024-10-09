export default function Quickstart() {
    return (
        <div className="flex-col justify-start items-center min-h-screen bg-base-200 mx-auto max-w-6xl">
            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                <article className="prose">
                    <h1>Quick Start</h1>
                    <h3>This serves as a guide for players with EDH experience</h3>
                    <li>60 card singleton decks</li>
                    <li>Refer to banlist as some EDH staples are banend (ie Sol Ring)</li>
                    <li>20 starting life</li>
                    <li>There is no commander damage</li>
                    <li>Your commander may be any legendary creature or planeswalker that is not banned</li>
                    <li>Companions are allowed however your deck AND commander must meet the companion requirement. Your companion must meet your commander color identity.</li>
                    </article>
                </div>
            </div>
        </div>
    );
}