'use client'
import { useEffect, useState } from "react";
import UserData from "../util/UserData";

async function getUserStats(token: string, userid: number) {
  return fetch(`/api/stats/user/${userid}`, {
  method: 'GET',
  headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token': token
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
    <div>
      <h1 className="text-4xl font-bold italic">{userName}</h1>
      <div className="stats flex mt-auto">
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
            <div className="stat-value">{userStats?.averageplacement.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
