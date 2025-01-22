'use client'
import { useEffect, useState } from "react";
import UserData from "../../util/UserData";

async function getUsersStats(token: string) {
  return fetch(`../api/stats/users`, {
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

export default function StatsUsers() {
  const {userToken} = UserData()
  const [usersStats, setUsersStats] = useState<any>();

  useEffect(() => {
    getUsersStats(userToken).then(items => {
      setUsersStats(items.usersStats);
  });
  }, []);
  
    return(
    <div className="max-w-6xl w-full">
      <div className="flex justify-between">
        <h1 className="text-4xl font-bold italic">Users</h1>
      </div>
      <div className="stats flex flex-col mt-auto">
      <table className="table bg-primary table-zebra">
            {/* head */}
            <thead>
              <tr>
                <th>Name</th>
                <th>Games Played</th>
                <th>Kills</th>
              </tr>
            </thead>
            <tbody>
            {usersStats?.sort((a:any,b:any) => b[1]["gamesPlayed"]-a[1]["gamesPlayed"]).map((ustats: any) =>
            {
              return <tr key={ustats[0]}>
                <td><a href={`/stats/users/${ustats[0]}`}>{ustats[1]["username"]}</a></td>
                <td>{ustats[1]["gamesPlayed"]}</td>
                <td>{ustats[1]["kills"]}</td>
              </tr>
            })}
            </tbody>
          </table>
      </div>
    </div>
  );
}