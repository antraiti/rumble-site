'use client'

import UserData from "@/app/util/UserData";
import { useEffect, useState } from "react";

export default function MatchCard(matchObject: any) {
    const { userId, isAdmin } = UserData(); 
    const matchInfo = matchObject.matchInfo;
    const decks = matchObject.decks;
    const [matchtime, setMatchtime] = useState<number>(0);
    const [canedit, setCanedit] = useState<boolean>(true);

    useEffect(() => {
        setTimeout(() => {
            setMatchtime(Date.now() - (new Date(matchInfo.match.start)).getTime());
            //setCanedit(Date.now() - (new Date(matchInfo.match.start)).getHours() < 25);
        }, 1000)
    }, [matchtime])

    function getCommanderImageUrl(deckCommander: any) {
        if (!deckCommander?.image) {
        return 'https://cards.scryfall.io/art_crop/front/0/e/0eb0e8e7-266f-441e-b1cd-12b8ec3f7d71.jpg'; // Imp's Mischief UwU
        }
    
        return deckCommander?.image;      
    }

    return (
        <div className="bg-primary rounded-xl m-5 flex flex-col shadow-xl">
            <div className="flex h-10 bg-secondary m-2 rounded-xl shadow-xl bg-gradient-to-r from-secondary via-neutral to-accent">
                <div className="flex w-full items-center justify-between">
                  <h3 className="mx-5">{matchInfo.match.name}</h3>
                  <div className="flex items-center mx-1">
                    {!matchInfo.match.start && <button className="btn btn-outline btn-success h-full min-h-0 mx-5" onClick={() => matchObject.updateTimestamp(matchInfo.match.id, "start")}>Start</button>}
                    {matchInfo.match.start && <h3 className="mx-5">{(new Date(matchInfo.match.start)).toLocaleTimeString()}</h3>}
                    {matchInfo.match.start && !matchInfo.match.end && <h3>{Math.floor((Math.floor((matchtime)/1000))/60/60)}:{((Math.floor((Math.floor((matchtime)/1000))/60)) % 60).toString().padStart(2,"0")}:{((Math.floor((matchtime)/1000)) % 60).toString().padStart(2,"0")}</h3>}
                    {(!matchInfo.match.end && matchInfo.match.start) && <button className="btn btn-outline btn-warning h-full min-h-0 mx-5" onClick={() => matchObject.updateTimestamp(matchInfo.match.id, "end")}>End</button>}
                    {matchInfo.match.end && <h3 className="mx-5">{(new Date(matchInfo.match.end)).toLocaleTimeString()}</h3>}
                    {!matchInfo.match.start && <button className="btn btn-outline btn-error h-8 min-h-0" onClick={() => matchObject.updateTimestamp(matchInfo.match.id, "delete")}>X</button>}
                  </div>
                </div>
            </div>
            <div className="mx-5 mb-5">
                <table className="table bg-gradient-to-r from-secondary via-neutral to-accent">
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
                    {matchInfo?.performances?.map((performance: any) => (<tr key={performance.id} className={performance?.placement == 1 ? "border-solid border-2 border-amber-300" : ""}>
                        <td className="p-0">
                            <div className="tooltip w-full" data-tip={(performance.deckid != null ? (decks.find((d: any) => d[0].id == performance.deckid)[1])?.name : "")}>
                                <a href={performance.deckid != null ? `/deck/${performance.deckid}` : ""} target="_blank">
                                    <img className=" h-16 w-full object-cover rounded-lg" src={getCommanderImageUrl(performance.deckid != null ? decks.find((d: any) => d[0].id == performance.deckid)[0] : null)}></img>
                                </a>    
                            </div>
                        </td>
                        <td>{performance.username}</td>
                        <td>
                            <select name="deckid" className="select select-ghost w-full" value={performance?.deckid ?? undefined} onChange={(e: any) => matchObject.updateMatch(e, performance.id)}>
                                <option value={undefined}></option>
                                {decks.filter((d: any) => d[0].userid == performance.userid && d[0].islegal).reverse().map((deck: any) => (<option value={deck[0].id} key={deck[0].id}>{`${deck[0].name}`}</option>))}
                            </select>
                        </td>
                        <td>
                            <select name="placement" className="select select-ghost" value={performance.placement ?? undefined} onChange={(e: any) => matchObject.updateMatch(e, performance.id)}>
                                <option value={undefined}></option>
                                {matchInfo.match.end ? Array.from(Array(matchInfo.performances.length).keys()).map(k => (<option value={k+1} key={"perf"+k}>{k+1}</option>))
                                : Array.from(Array(matchInfo.performances.length-1).keys()).map(k => (<option value={k+2} key={"perf"+k}>{k+2}</option>))}
                            </select>
                        </td>
                        <td>
                            <select disabled={!canedit && !isAdmin} name="order" className="select select-ghost" value={performance.order ?? undefined} onChange={(e: any) => matchObject.updateMatch(e, performance.id)}>
                                <option value={undefined}></option>
                                {Array.from(Array(matchInfo.performances.length).keys()).map(k => (<option value={k+1} key={"order"+k}>{k+1}</option>))}
                            </select>
                        </td>
                        <td>
                            <select disabled={!canedit && !isAdmin} name="killedbyuid" className="select select-ghost" value={performance.killedby ?? undefined} onChange={(e: any) => matchObject.updateMatch(e, performance.id)}>
                                <option value={undefined}>Killed By</option>
                                {matchInfo.performances.map((p: any) => (<option value={p.userid} key={"kb"+p.id}>{p.username}</option>))}
                            </select>
                        </td>
                        {!matchInfo.match.start && <td className="w-5 p-0"><button name="delete" className="btn btn-outline btn-error w-5 h-16 m-0" onClick={(e: any) => matchObject.updateMatch(e, performance.id)}>X</button></td>}
                    </tr>))}
                    </tbody>
                </table>
                {!matchInfo.match.start && 
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-outline btn-info m-1 min-h-0 h-full mt-2">+</div>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                        {matchObject.userlist.map((u: any) => 
                            (<button className="cursor-pointer hover:bg-primary h-8" key={u.id}
                            onClick={(e: any) => matchObject.addPerformance(e.target.value, matchInfo.match.id)} 
                            value={u.id}>
                                {u.username}
                            </button>))}
                        </ul>
                  </div>}
                  {!matchInfo.match.start && 
                  !matchInfo.performances.find((p: any) => p.userid == userId) && 
                  <div tabIndex={0} role="button" className="btn btn-outline btn-info m-1 min-h-0 h-full mt-2" onClick={(e: any) => matchObject.requestMatchJoin(matchInfo.match.id)}>
                    Join Me
                </div>}
                </div>
        </div>
    );
}
