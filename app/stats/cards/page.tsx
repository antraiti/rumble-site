'use client'
import { useEffect, useState } from "react";
import UserData from "../../util/UserData";

async function getCardsStats(token: string, userid: number) {
    return fetch(`../api/stats/cards`, {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token,
      'Cache-Control': 'no-store'
    }})
    .then(data => {
        if(data.status >= 400) {
            throw new Error("Server responds with error!");
        }
        return data.json();
    })
  }

export default function StatsCards() {
    const {userToken, userName, userId} = UserData()
    const [cardsStats, setCardsStats] = useState<any[]>([]);
    const [printings, setPrintings] = useState<any[]>([]);
    const [searchText, setSearchText] = useState<string>("");

    useEffect(() => {
        getCardsStats(userToken, userId).then(items => {
            setCardsStats(items["cards"]);
            setPrintings(items["printings"])
            console.log(items);
    });
    }, []);

    return(
      <div className="max-w-6xl w-full">
        <div className="pb-2">
        <label className="input input-bordered flex items-center gap-2 h-8 w-72">
          Search
          <input type="text" className="grow" placeholder="Name" value={searchText} onChange={(e:any) => setSearchText(e.target.value)}/>
        </label>
        </div>
        <div className="overflow-x-auto">
          <table className="table bg-primary table-zebra">
            {/* head */}
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Cost</th>
                <th>MV</th>
                <th>Type</th>
                <th>Plays</th>
                <th>Wins</th>
                <th>Avg. Placement</th>
              </tr>
            </thead>
            <tbody>
            {cardsStats?.filter(cs => cs[1]["card"]["name"].toLowerCase().includes(searchText?.toLowerCase())).sort((a:any,b:any) => b[1]["count"]-a[1]["count"]).slice(0,20).map((crdstats: any) =>
            {
              return <tr>
                <td className="p-0"><img className="h-8 w-full object-cover p-0" src={printings?.find(p => p.cardid == crdstats[0]).artcrop}/></td>
                <td>{crdstats[1]["card"]["name"]}</td>
                <td>{crdstats[1]["card"]["cost"]}</td>
                <td>{crdstats[1]["card"]["mv"]}</td>
                <td>{crdstats[1]["card"]["typeline"]}</td>
                <td>{crdstats[1]["count"]}</td>
                <td>{crdstats[1]["wins"]}</td>
                <td>{(crdstats[1]["placementtotal"]/crdstats[1]["count"]).toFixed(2)}</td>
              </tr>
            })}
            </tbody>
          </table>
          <div className="flex flex-row w-full justify-between items-center">
            <h3 className="text-sm">20 of {cardsStats?.length} Total</h3>
            <div>
              <div className="join">
                <button className="join-item btn">First</button>
                <button className="join-item btn">Prev</button>
              </div>
              <div className="join">
                <button className="join-item btn">Next</button>
                <button className="join-item btn">Last</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }