'use client'
import { useEffect, useState } from "react";
import UserData from "../../util/UserData";

async function getGlobalStats(token: string, userid: number) {
  return fetch(`../api/stats/global`, {
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
  const [globalStats, setGlobalStats] = useState<any>();

  useEffect(() => {
    getGlobalStats(userToken, userId).then(items => {
        setGlobalStats(items);
  });
  }, []);
  
  return(
    <div className="max-w-6xl w-full">
      <h1 className="text-4xl font-bold italic">Global Stats</h1>
      <div className="stats flex flex-col mt-auto">
        <div className="flex justify-between">
          <div className="stat">
              <div className="stat-title">Matches Played</div>
              <div className="stat-value">{globalStats?.matchesplayed}</div>
          </div>
          <div className="stat">
              <div className="stat-title">Average Match Duration</div>
              <div className="stat-value">{`${Math.floor(globalStats?.averagematchtime/60) > 60 ? Math.floor(globalStats?.averagematchtime/3600) + ":" : ""}${Math.floor(globalStats?.averagematchtime/60)}:${(globalStats?.averagematchtime%60).toFixed(0)}`}</div>
          </div>
          <div className="stat">
              <div className="stat-title">Average Match Size</div>
              <div className="stat-value">{globalStats?.averagematchsize.toFixed(2)}</div>
          </div>
        </div>
        <div className="divider  border-hidden"/>
        <div className="flex justify-around border-hidden">
          <ColorStat name="White" playcount={globalStats?.colorplaycount.w} winrate={globalStats?.colorwinrates.w.toFixed(2) * 100 + "%"} imgname="W.svg"/>
          <ColorStat name="Blue" playcount={globalStats?.colorplaycount.u} winrate={globalStats?.colorwinrates.u.toFixed(2) * 100 + "%"} imgname="U.svg"/>
          <ColorStat name="Red" playcount={globalStats?.colorplaycount.r} winrate={globalStats?.colorwinrates.r.toFixed(2) * 100 + "%"} imgname="R.svg"/>
          <ColorStat name="Green" playcount={globalStats?.colorplaycount.g} winrate={globalStats?.colorwinrates.g.toFixed(2) * 100 + "%"} imgname="G.svg"/>
          <ColorStat name="Black" playcount={globalStats?.colorplaycount.b} winrate={globalStats?.colorwinrates.b.toFixed(2) * 100 + "%"} imgname="B.svg"/>
          <ColorStat name="Colorless" playcount={globalStats?.colorplaycount.c} winrate={globalStats?.colorwinrates.c.toFixed(2) * 100 + "%"} imgname="C.svg"/>
        </div>
      </div>
    </div>
  );
}

function ColorStat(props: any){
  return(<div>
    <div className="flex flex-col shadow-xl">
            <div className="flex justify-evenly">
                <img className="h-8 w-8 self-center" src={`../../${props.imgname}`}></img>
                <div className="text-5xl font-bold">{props.playcount}</div>
            </div>
            <div className="stat">
                <div className="stat-title">Winrate</div>
                <div className="stat-value">{props.winrate}</div>
            </div>
        </div>
  </div>);
}
