'use client'

import { useCallback, useEffect, useState } from "react";
import { useWebSocket } from 'next-ws/client';
import userData from "../../util/UserData"
import MatchCard from "./MatchCard";

async function GetEventDetails(token: string, eventid: number) {
    return fetch(`/api/events/details/${eventid}`, {
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
            } else if (data.status === 204) {
                return [];
            }
            return data.json();
        })
    }

async function updatePerformance(token: string, id: number, key: any, val: any | null) {
    return fetch(`/api/performance/`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': token
        },
        body: JSON.stringify({'id': id, [key]: val})
        })
        .then(data => {
            if(data.status >= 400) {
                throw new Error("issue updating performance");
            }
            return data.json();
        })
    }

async function addPerformance(token: string, user: number, match: number) {
    return fetch(`/api/performance/`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': token
        },
        body: JSON.stringify({"userid": user, "matchid": match})
        })
        .then(data => {
            if(data.status >= 400) {
                throw new Error("issue updating performance");
            }
            return data.json();
        })
    }

async function newMatch(token: string, id: number) {
    return fetch(`/api/match/`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': token
        },
        body: JSON.stringify(id)
        })
        .then(data => {
            if(data.status >= 400) {
                throw new Error("issue updating performance");
            }
            return data.json();
        })
    }

async function getUsers(token: string) {
    return fetch('/api/users', {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }})
    .then(data => {
        if(data.status >= 400) {
            throw new Error("Server responds with error!");
        }
        return data.json();
    })
}

async function updateMatchTimestamp(token: string, match: number, prop: string) {
    return fetch('/api/match', {
    method: 'PUT',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token
    },
    body: JSON.stringify({'prop': prop, 'matchid': match})
    })
    .then((data: any) => {
        if(data.status >= 400) {
            throw new Error(data.message);
        }
        return data.json();
    })
  }

export default function DeckDetails({ params }: { params: { eventid: number }}) {
    const [eventDetails, setEventDetails] = useState<any>();
    const { user, userToken } = userData();
    const [ userList, setUserList ] = useState([]);
    const ws = useWebSocket();

    useEffect(() => {
        ws?.addEventListener('message', receivedUpdate);
        updateEventDetails();
        getUsers(userToken).then(items => {
            setUserList(items);
        });
        return () => ws?.removeEventListener('message', receivedUpdate);
    }, [ws]);

    const receivedUpdate = (e: any) => {
        updateEventDetails();
    }

    function updateEventDetails() {
        GetEventDetails(userToken, params.eventid).then(data => {
            setEventDetails(data);
        });
    }

    const updateMatch = (e: any, perfid: number) => {
        updatePerformance(userToken, perfid, e.target.name, e.target.value).then(() => {
            ws?.send("buh");
            updateEventDetails();
        });
      }
    
    const requestNewMatch = () => {
        newMatch(userToken, params.eventid).then(() => {
            ws?.send("buh");
            updateEventDetails();
        })
    }

    const requestMatchTimestampUpdate = (matchid: number, prop: string) => {
        console.log(`${matchid} ${prop}`);
        updateMatchTimestamp(userToken, matchid, prop).then(() => {
            ws?.send("buh");
            updateEventDetails();
        })
    }

    const requestNewPerformance = (userid: number, matchid: number) => {
        addPerformance(userToken, userid, matchid).then(() => {
            ws?.send("buh");
            updateEventDetails();
        })
    }

    return(
        <div className="bg-base-200 h-full">
            <div className="flex flex-col w-full max-w-6xl justify-center mx-auto">
                <button className="btn btn-outline btn-success max-w-2xl mx-auto w-full mt-5" onClick={() => requestNewMatch()}>Create Match</button>
                {eventDetails && eventDetails.matches.slice(0).reverse().map((match: any) => (
                    <MatchCard 
                    key={match.id} 
                    matchInfo={match} 
                    decks={eventDetails.decks} 
                    updateMatch={updateMatch} 
                    userlist={userList}
                    addPerformance={requestNewPerformance}
                    updateTimestamp={requestMatchTimestampUpdate}/>
                ))}
            </div>
        </div>
    );
}