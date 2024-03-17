'use client'
import { useEffect, useState } from "react";
import UserData from "../util/UserData";

async function getUserStats(token: string, userid: number) {
  return fetch(`api/stats/user/${userid}`, {
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

export default function StatsHome() {
  const {userToken, userName, userId} = UserData()
  const [userStats, setUserStats] = useState<any>();

  useEffect(() => {
    getUserStats(userToken, userId).then(items => {
      setUserStats(items);
      console.log(items);
  });
  }, []);
  
  return(
    <div className="max-w-6xl w-full">
      <h1 className="text-4xl font-bold italic">{userName}</h1>
      <div className="stats flex flex-col mt-auto">
        <div className="flex justify-between">
          <div className="stat">
              <div className="stat-title">Games Played</div>
              <div className="stat-value">{userStats?.matchesplayed}</div>
          </div>
          <div className="stat">
              <div className="stat-title">Matches Won</div>
              <div className="stat-value">{userStats?.matcheswon}</div>
          </div>
          <div className="stat">
              <div className="stat-title">Avg. Placement</div>
              <div className="stat-value">{(userStats?.averageplacement ?? 0 > 0) ? userStats?.averageplacement?.toFixed(2) : "0"}</div>
          </div>
        </div>
        <div className="divider  border-hidden"/>
        <div className="flex justify-around border-hidden">
          <ColorStat name="White" playcount={userStats?.colorplaycount.w} winrate={(userStats?.colorwinrates.w * 100).toFixed(2) + "%"} imgname="W.svg"/>
          <ColorStat name="Blue" playcount={userStats?.colorplaycount.u} winrate={(userStats?.colorwinrates.u * 100).toFixed(2) + "%"} imgname="U.svg"/>
          <ColorStat name="Red" playcount={userStats?.colorplaycount.r} winrate={(userStats?.colorwinrates.r * 100).toFixed(2) + "%"} imgname="R.svg"/>
          <ColorStat name="Green" playcount={userStats?.colorplaycount.g} winrate={(userStats?.colorwinrates.g * 100).toFixed(2) + "%"} imgname="G.svg"/>
          <ColorStat name="Black" playcount={userStats?.colorplaycount.b} winrate={(userStats?.colorwinrates.b * 100).toFixed(2) + "%"} imgname="B.svg"/>
          <ColorStat name="Colorless" playcount={userStats?.colorplaycount.c} winrate={(userStats?.colorwinrates.c * 100).toFixed(2) + "%"} imgname="C.svg"/>
        </div>
      </div>
    </div>
  );
}

function ColorStat(props: any){
  return(<div>
    <div className="flex flex-col shadow-xl">
            <div className="flex justify-evenly">
                <img className="h-8 w-8 self-center" src={props.imgname}></img>
                <div className="text-5xl font-bold">{props.playcount}</div>
            </div>
            <div className="stat">
                <div className="stat-title">Winrate</div>
                <div className="stat-value">{props.winrate}</div>
            </div>
        </div>
  </div>);
}
