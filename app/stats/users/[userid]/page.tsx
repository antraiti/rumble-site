'use client'
import { useEffect, useState } from "react";
import UserData from "../../../util/UserData";

async function getUserStats(token: string, userid: number) {
  return fetch(`../../api/stats/users/${userid}`, {
  method: 'GET',
  headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token': token,
	'Cache-Control': 'no-store'
  }})
  .then(data => {
      if(data.status >= 400) {
          console.log("error")
          //throw new Error("Server responds with error!");
      }
      return data.json();
  })
}

export default function StatsUser({ params }: { params: { userid: number }}) {
  const {userToken, userName} = UserData()
  const [userStats, setUserStats] = useState<any>();
  const [commanders, setCommanders] = useState<any>([])
  const [startDate, setStartDate] = useState<any>()
  const [endDate, setEndDate] = useState<any>()

  useEffect(() => {
    getUserStats(userToken, params.userid).then(items => {
      setUserStats(items);

      const commandersMap = new Map()
      items["performances"].filter((p: any) => p["userid"] == params.userid).map((p: any) => {
        if (!p.deckid) return;
        const deck = items["decks"].find((d: any) => d.id == p.deckid)
        const match = items["matches"].find((m: any) => m.id == p.matchid)
        const commanderInfo = items["cards"].find((c: any) => c.id == deck["commander"])
        if (!commanderInfo) return;

        if(commandersMap.has(deck["commander"])) {
          commandersMap.set(deck["commander"], 
            [...commandersMap.get(deck["commander"]), 
              {
                commander: deck["commander"],
                cardname: commanderInfo["name"],
                win: p["placement"] == 1,
                date: match["start"]
              }
            ])
        } else {
          commandersMap.set(deck["commander"], 
            [ 
              {
                commander: deck["commander"],
                cardname: commanderInfo["name"],
                win: p["placement"] == 1,
                date: match["start"]
              }
            ])
        }
      })

      setCommanders(Array.from(commandersMap))
  });
  }, []);

  function DateOrUndefined(input: string) {
    const date = new Date(input)
    return date.toString() == "Invalid Date" ? undefined : date
  }

  return(
    <div className="card shadow-xl bg-primary p-5 m-5 w-full">
      <h1 className="text-xl font-bold mx-auto">Commanders Played</h1>
      <div className="flex justify-end flex-row">
        <input onChange={e => setStartDate(DateOrUndefined(e.target.value))} type="text" placeholder="Start Date" className="input input-bordered m-5 max-w-m"/>
        <input onChange={e => setEndDate(DateOrUndefined(e.target.value))} type="text" placeholder="End Date" className="input input-bordered m-5 max-w-m"/>
      </div>
      <table className="table bg-secondary shadow-xl table-zebra">
            {/* head */}
            <thead>
              <tr>
                <th>Commander</th>
                <th>Games Played</th>
                <th>Wins</th>
              </tr>
            </thead>
            <tbody>
            {commanders?.filter((c: any) => (!startDate || new Date(c[1][0].date) > startDate) && (!endDate || new Date(c[1][0].date) < endDate)).sort((a:any,b:any) => b[1].length-a[1].length).map((cstats: any) =>
            {
              return <tr key={cstats[0]}>
                <td>{cstats[1][0].cardname}</td>
                <td>{cstats[1].length}</td>
                <td>{cstats[1].filter((e: any) => e.win).length}</td>
              </tr>
            })}
            </tbody>
          </table>
    </div>
  );
}