'use client'
import { useEffect, useState } from "react";
import UserData from "../../util/UserData";

async function getWatchlistStats(token: string, userid: number) {
    return fetch(`../api/stats/watchlist`, {
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

export default function StatsGlobal() {
    const {userToken, userName, userId} = UserData()
    const [watchlistStats, setWatchlistStats] = useState<any>([]);

    useEffect(() => {
        getWatchlistStats(userToken, userId).then(items => {
            setWatchlistStats(items.data);
            console.log(items);
    });
    }, []);
    return(
      <div className="max-w-6xl w-full">
        {
            watchlistStats?.map((wls: any) =>
            {
                return <div className="flex">
                        <div className="w-72">{wls.name}</div>
                        <div className="w-48">Appearances: {wls.playcount}</div>
                        <div className="w-24">Wins: {wls.wincount}</div>
                        <div className="w-48">Average Placement: {wls.average.toFixed(2)}</div>
                    </div>
            })
        }
      </div>
    );
  }