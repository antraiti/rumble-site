'use client'

import { useCallback, useEffect, useState } from "react";
import { useWebSocket } from 'next-ws/client';
import userData from "../../util/UserData"
import MatchCard from "./MatchCard";
import React from "react";
import { apiGet, apiPost, apiPut } from "../../util/apiClient";

async function GetEventDetails(token: string, eventid: number) {
    return apiGet(`events/details/${eventid}`, { token });
    }

async function updatePerformance(token: string, id: number, key: any, val: any | null) {
    const numericFields = ['deckid', 'placement', 'order', 'killedbyuid'];
    const nullableFields = ['deckid', 'placement', 'order'];
    const clearField = val === '' && nullableFields.includes(key);
    const isKilledByPlaceholder = key === 'killedbyuid' && val === 'Killed By';
    const value = numericFields.includes(key) && val !== '' && !isKilledByPlaceholder ? Number(val) : val;
    const body = clearField ? { id, clear: key } : { id, [key]: value };
    return apiPut('performance', { token, body });
    }

async function addPerformance(token: string, user: string, match: number) {
    return apiPost('performance', { token, body: {"userid": user, "matchid": match} });
    }

async function newMatch(token: string, id: number) {
    return apiPost('match', { token, body: id });
    }

async function getUsers(token: string) {
    return apiGet('users', { token });
}

async function updateMatchProperty(token: string, match: number, prop: string) {
    return apiPut('match', { token, body: {'prop': prop, 'matchid': match} });
  }

export interface DeckDetailsProps {
    eventid: number;
}

export default function DeckDetails({ params }: {params: Promise<DeckDetailsProps>}) {
    const {eventid} = React.use(params);
    const [eventDetails, setEventDetails] = useState<any>();
    const { user, userName, userToken, userId } = userData();
    const [ userList, setUserList ] = useState([]);
    const ws = useWebSocket();
    const themedweekly = eventDetails?.event.weekly && eventDetails?.event.themed;
    
    function availablePlayers() {
        return userList.filter((u: any) => 
                        { 
                            return !eventDetails.matches.filter((m: any) => !m.match.end)?.find((om: any) => om.performances?.find((p: any) => p.userid == u.id))
                        });
    }

    function updateEventDetails() {
        console.log(eventid)
        GetEventDetails(userToken, eventid).then(data => {
            setEventDetails(data);
        });
    }

    const receivedUpdate = (e: any) => {
        updateEventDetails();
    }

    useEffect(() => {
        ws?.addEventListener('message', receivedUpdate);
        updateEventDetails();
        getUsers(userToken).then(items => {
            setUserList(items);
        });
        return () => ws?.removeEventListener('message', receivedUpdate);
    }, [ws]);

    const updateMatch = (e: any, perfid: number) => {
        updatePerformance(userToken, perfid, e.target.name, e.target.value).then(() => {
            ws?.send("buh");
            updateEventDetails();
        });
      }
    
    const requestNewMatch = () => {
        newMatch(userToken, eventid).then(() => {
            ws?.send("buh");
            updateEventDetails();
        })
    }

    const requestMatchTimestampUpdate = (matchid: number, prop: string) => {
        updateMatchProperty(userToken, matchid, prop).then(() => {
            ws?.send("buh");
            updateEventDetails();
        })
    }

    const requestNewPerformance = (userid: string, matchid: number) => {
        addPerformance(userToken, userid, matchid).then(() => {
            ws?.send("buh");
            updateEventDetails();
        })
    }

    const requestMatchJoin = (matchid: number) => {
        addPerformance(userToken, userId, matchid).then(() => {
            ws?.send("buh");
            updateEventDetails();
        })
    }

    const setMatchPower = (matchid: number, powername: number) => {
        updateMatchProperty(userToken, matchid, powername.toString()).then(() => {
            ws?.send("buh");
            updateEventDetails();
        })
    }

    return(
          <div className="bg-base-200 min-h-screen" data-theme={eventDetails?.event.themed && eventDetails?.theme?.stylename ? eventDetails?.theme.stylename : "mytheme"}>
              <div className="flex flex-col w-full max-w-6xl justify-center mx-auto">
                  <div className="card shadow-xl bg-base-100 h-20 m-3">
                    <div className="flex justify-between">
                      <div className="mx-5">
                        <h2 className="h-5">{themedweekly ? eventDetails?.event.name.split(":")[0] : " "}</h2>
                        <h1 className="text-4xl italic font-bold">{themedweekly ? eventDetails?.event.name.split(": ")[1] : eventDetails?.event.name}</h1>
                      </div>
                      <div className="mx-5">
                        <h2>{eventDetails?.event.themed ? eventDetails?.theme?.name : "No Theme"}</h2>
                      </div>
                    </div>
                  </div>
                  <button key={"newmatchbutton"} className="btn btn-outline btn-success max-w-2xl mx-auto w-full mt-5" onClick={() => requestNewMatch()}>Create Match</button>
                  {eventDetails && eventDetails.matches.slice(0).reverse().map((match: any) => (
                      <MatchCard 
                      key={match.match.id} 
                      matchInfo={match} 
                      decks={eventDetails.decks} 
                      updateMatch={updateMatch} 
                      userlist={availablePlayers()}
                      addPerformance={requestNewPerformance}
                      updateTimestamp={requestMatchTimestampUpdate}
                      requestMatchJoin={requestMatchJoin}
                      setMatchPower={setMatchPower}
                      themed={eventDetails?.event.themed}/>
                  ))}
              </div>
          </div>
    );
}
