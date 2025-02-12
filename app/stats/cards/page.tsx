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
    const [pageNum, setPageNum] = useState<number>(0);
    const [sortDir, setSortDir] = useState<boolean>(true);
    const [sortCol, setSortCol] = useState<string>("plays");
    const pageSize = 25;

    useEffect(() => {
        getCardsStats(userToken, userId).then(items => {
            setCardsStats(items["cards"]);
            setPrintings(items["printings"])
            console.log(items);
    });
    }, []);

    function sortPage(col: any) {
      if(sortCol == col) {
        setSortDir(prev => !prev);
      } else {
        setSortCol(col);
        setSortDir(true);
      }
    }

    function getSortVal(a:any,b:any){
      switch(sortCol){
        case("plays"):
          if(sortDir)
            return (b[1]["count"]-a[1]["count"])
          else
            return (a[1]["count"]-b[1]["count"])
        case("wins"):
          if(sortDir)
            return (b[1]["wins"]-a[1]["wins"])
          else
            return (a[1]["wins"]-b[1]["wins"])
        case("avgplacement"):
          if(sortDir)
            return (a[1]["placementtotal"]/a[1]["count"])-(b[1]["placementtotal"]/b[1]["count"])
          else
            return (b[1]["placementtotal"]/b[1]["count"])-(a[1]["placementtotal"]/a[1]["count"])
        case("mv"):
          if(sortDir)
            return (b[1]["card"]["mv"]-a[1]["card"]["mv"])
          else
            return (a[1]["card"]["mv"]-b[1]["card"]["mv"])
        case("name"):
          if(sortDir)
            return (b[1]["card"]["name"]>a[1]["card"]["name"]) ? -1 : 1
          else
            return (a[1]["card"]["name"]>b[1]["card"]["name"]) ? -1 : 1
      }
    }

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
                <th onClick={() => sortPage("name")}>Name</th>
                <th>Cost</th>
                <th onClick={() => sortPage("mv")}>MV</th>
                <th>Type</th>
                <th onClick={() => sortPage("plays")}>Plays</th>
                <th onClick={() => sortPage("wins")}>Wins</th>
                <th onClick={() => sortPage("avgplacement")}>Avg. Placement</th>
              </tr>
            </thead>
            <tbody>
            {cardsStats?.filter(cs => cs[1]["card"]["name"].toLowerCase().includes(searchText?.toLowerCase())).sort((a:any,b:any) => getSortVal(a,b)!).slice(pageNum * pageSize,(pageNum * pageSize)+pageSize).map((crdstats: any) =>
            {
              return <tr key={crdstats[0]}>
                <td className="p-0"><img className="h-8 w-full object-cover p-0" src={crdstats[1]["artcrop"]}/></td>
                <td><a className="hover:font-bold" href={`https://scryfall.com/search?q=oracleid=${crdstats[1]["card"]["id"]}`}target="_blank">{crdstats[1]["card"]["name"]}</a></td>
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
            <h3 className="text-sm">{cardsStats?.length} Total</h3>
            <div className="flex flex-row items-center">
              <div className="join">
                <button className="join-item btn" onClick={() => setPageNum(0)}>First</button>
                <button className="join-item btn" onClick={() => setPageNum(prev => Math.max(prev-1, 0))}>Prev</button>
              </div>
              <h3  className="text-sm align-middle">Page {pageNum+1} of {Math.floor(cardsStats.length/pageSize)+1}</h3>
              <div className="join">
                <button className="join-item btn" onClick={() => setPageNum(prev => Math.min(prev+1, Math.floor(cardsStats.length/pageSize)))}>Next</button>
                <button className="join-item btn" onClick={() => setPageNum(Math.floor(cardsStats.length/pageSize))}>Last</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }