'use client'
import { useEffect, useState } from "react";
import userData from "../../util/UserData"

async function getDeckInfo(token: string, id: number) {
    return fetch('/api/deck/'+id, {
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

export default function DeckDetails({ params }: { params: { deckid: number }}) {
    const { userToken } = userData();
    const [deckData, setDeckData] = useState<any | null>();
    const [userlist, setUserlist] = useState<any | null>();

    useEffect(() => {
        getDeckInfo(userToken, params.deckid).then((item) => {
            setDeckData(item);
        });
        getUsers(userToken).then(items => {
            setUserlist(items);
        });
      }, [])

    return(
    <div className="mx-auto m-5 p-5 max-w-7xl">
        <h1 className="text-4xl italic font-bold">{deckData ? deckData?.deck.name : "loading"}</h1>
        <h2>{deckData && userlist && userlist.find((user: any) => user.id == deckData.deck.userid)?.username}</h2>
        <div className="pt-5">
            <h2>{"Mainboard:"}</h2>
            <div className="grid w-full lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1">
                {deckData && deckData?.cardlist.filter((card: any) => !card[0].issideboard).map((card: any) => {
                    return CardDisplay(card);
                })}
            </div>
            <h2>{"Sideboard:"}</h2>
            <div className="grid w-full lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1">
                {deckData && deckData?.cardlist.filter((card: any) => card[0].issideboard).map((card: any) => {
                    return CardDisplay(card);
                })}
            </div>
        </div>
    </div>);
}

function CardDisplay(card: any) {
    return (<div className={`flex bg-secondary h-6 w-64 rounded-md m-1 ${card[0].iscommander ? "border-yellow-500 border " : ""}`}>
                            <div className="px-2">{card[0].count}</div>
                            <a className="hover:font-bold" href={`https://scryfall.com/card/${card[1].id}`}target="_blank">{card[1].name.split("//")[0]}</a>
                            {card[1].watchlist && <svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#fff700" stroke="#fff700"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>Alert</title> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Alert"> <rect id="Rectangle" fill-rule="nonzero" x="0" y="0" width="24" height="24"> </rect> <line x1="12" y1="13" x2="12" y2="9" id="Path" stroke="#fff700" stroke-width="2" stroke-linecap="round"> </line> <line x1="12" y1="16.5" x2="12" y2="16.63" id="Path" stroke="#fff700" stroke-width="2" stroke-linecap="round"> </line> <path d="M10.2679,5.0000025 C11.0377,3.66667 12.9622,3.66667 13.732,5.0000025 L20.6602,17.0000025 C21.43,18.3333 20.4678,20.0000025 18.9282,20.0000025 L5.07177,20.0000025 C3.53217,20.0000025 2.56992,18.3333 3.33972,17.0000025 L10.2679,5.0000025 Z" id="Path" stroke="#fff700" stroke-width="2" stroke-linecap="round"> </path> </g> </g> </g></svg>}
                        </div>);
}