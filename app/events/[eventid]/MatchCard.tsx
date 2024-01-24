

export default function MatchCard(matchObject: any) {
    const matchInfo = matchObject.matchInfo;
    const decks = matchObject.decks;

    function getCommanderImageUrl(deckCommander: any) {
        if (!deckCommander?.commander) {
        return 'https://cards.scryfall.io/art_crop/front/0/e/0eb0e8e7-266f-441e-b1cd-12b8ec3f7d71.jpg'; // Imp's Mischief UwU
        }
    
        const commanderId = deckCommander.commander;
        let url = 'https://cards.scryfall.io/art_crop/front';
        url += '/' + commanderId.substring(0, 1);
        url += '/' + commanderId.substring(1, 2) + '/';
        url += commanderId + '.jpg';
    
        return url;      
    }

    return (
        <div className="bg-primary rounded-xl m-5 flex flex-col">
            <div className="flex h-10 bg-secondary m-2 rounded-xl shadow-xl">
                <div className="flex w-full items-center justify-between">
                  <h3 className="mx-5">{matchInfo.match.name}</h3>
                  <div className="flex items-center mx-1">
                    {!matchInfo.match.start && <button className="btn btn-outline btn-success h-full min-h-0 mx-5" onClick={() => matchObject.updateTimestamp(matchInfo.match.id, "start")}>Start</button>}
                    {matchInfo.match.start && <h3 className="mx-5">{(new Date(matchInfo.match.start)).toLocaleTimeString()}</h3>}
                    {(!matchInfo.match.end && matchInfo.match.start) && <button className="btn btn-outline btn-warning h-full min-h-0 mx-5" onClick={() => matchObject.updateTimestamp(matchInfo.match.id, "end")}>End</button>}
                    {matchInfo.match.end && <h3 className="mx-5">{(new Date(matchInfo.match.end)).toLocaleTimeString()}</h3>}
                    {!matchInfo.match.start && <button className="btn btn-outline btn-error h-8 min-h-0" onClick={() => matchObject.updateTimestamp(matchInfo.match.id, "delete")}>X</button>}
                  </div>
                </div>
            </div>
            <div className="mx-5 mb-5">
                <table className="table bg-secondary">
                    <thead>
                    <tr>
                        <th>Commander</th>
                        <th>Player</th>
                        <th>Deck Name</th>
                        <th>Placement</th>
                        <th>Turn Order</th>
                        <th>Killed By</th>
                    </tr>
                    </thead>
                    <tbody>
                    {matchInfo.performances.map((performance: any) => (<tr key={performance.username} className={performance.placement == 1 ? "border-solid border-2 border-amber-300" : ""}>
                        <td className="p-0"><img className=" h-16 w-full object-cover rounded-lg" src={getCommanderImageUrl(decks.find(d => d.id == performance.deckid))}></img></td>
                        <td>{performance.username}</td>
                        <td>
                            <select name="deckid" className="select bg-secondary w-full" value={performance.deckid} onChange={(e) => matchObject.updateMatch(e, performance.id)}>
                                <option value={null}></option>
                                {decks.filter(d => d.userid == performance.userid).map(deck => (<option value={deck.id} key={deck.id}>{deck.name}</option>))}
                            </select>
                        </td>
                        <td>
                            <select name="placement" className="select bg-secondary" value={performance.placement} onChange={(e) => matchObject.updateMatch(e, performance.id)}>
                                <option value={null}></option>
                                {[...Array(matchInfo.performances.length).keys()].map(k => (<option value={k+1} key={"perf"+k}>{k+1}</option>))}
                            </select>
                        </td>
                        <td>
                            <select name="order" className="select bg-secondary" value={performance.order} onChange={(e) => matchObject.updateMatch(e, performance.id)}>
                                <option value={null}></option>
                                {[...Array(matchInfo.performances.length).keys()].map(k => (<option value={k+1} key={"order"+k}>{k+1}</option>))}
                            </select>
                        </td>
                        <td>
                            <select name="killedbyuid" className="select bg-secondary" value={performance.killedby} onChange={(e) => matchObject.updateMatch(e, performance.id)}>
                                <option value={null}>Killed By</option>
                                {matchInfo.performances.map(p => (<option value={p.userid} key={"kb"+p.userid}>{p.username}</option>))}
                            </select>
                        </td>
                        {!matchInfo.match.start && <button name="delete" className="btn btn-outline btn-error w-5 h-16 m-0" onClick={(e) => matchObject.updateMatch(e, performance.id)}>X</button>}
                    </tr>))}
                    </tbody>
                </table>
                {!matchInfo.match.start && 
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-outline btn-info m-1 min-h-0 h-full mt-2">+</div>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                        {matchObject.userlist.map(u => 
                            (<li className="cursor-pointer" key={u.publicid}
                            onClick={(e) => matchObject.addPerformance(e.target.value, matchInfo.match.id)} 
                            value={u.publicid}>
                                {u.username}
                            </li>))}
                        </ul>
                  </div>}
                </div>
        </div>
    );
}
