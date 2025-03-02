'use client'
import { useEffect, useState } from "react";
import userData from "../util/UserData"
import DeckCard from "./DeckCard";
import { useRouter } from "next/navigation";

async function getColors() {
    return fetch('api/colors', {
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

async function getDecks(token: string) {
    return fetch('api/decks', {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token
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

export default function Decks() {
    const { userToken } = userData();
    const router = useRouter();
    const [decks, setDecks] = useState([]);
    const [colors, setColors] = useState([]);
    const [performances, setPerformances] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [colorFilter, setColorFilter] = useState({blue: false, black: false, red: false, green: false, white: false});

    useEffect(() => {
        let mounted = true;

        getColors()
        .then(c => {
            if(mounted) {
                setColors(c)
            }})

        getDecks(userToken)
        .then(items => {
            console.log(items);
            if(mounted) {
                setDecks(items.deckandcards)
                setPerformances(items.performances)
            }})

      }, [])

    function deckInColors(identityid: number) {
        const icolor: any = colors.find((c: any) => c.id == identityid)
        if (!icolor) {console.log(`color not found ${identityid}`); return false;}

        //if no filters active alwaysr return true
        if (!colorFilter.red &&
            !colorFilter.green &&
            !colorFilter.blue &&
            !colorFilter.white &&
            !colorFilter.black)
            return true;

        return (
            (colorFilter.red ? icolor.red : !icolor.red)
            && (colorFilter.green ? icolor.green : !icolor.green)
            && (colorFilter.blue ? icolor.blue : !icolor.blue)
            && (colorFilter.white ? icolor.white : !icolor.white)
            && (colorFilter.black ? icolor.black : !icolor.black)
        )
    }

    return (
    <div>
        <div className="navbar m-3 max-w-7xl mx-auto">
            <div className="flex h-full w-full justify-around items-center align-middle">
                <input type="text" placeholder="Search" className="input input-bordered w-full max-w-xs" onChange={e => setSearchValue(e.target.value)}/>
                <div className="flex gap-10 overflow-hidden">
                    <input type="checkbox" checked={colorFilter.red} onClick={_ => setColorFilter(prev => {return {...prev, red: !prev.red}})} className="checkbox border-red-400 checked:bg-red-400 [--chkfg:black]" />
                    <input type="checkbox" checked={colorFilter.blue} onClick={_ => setColorFilter(prev => {return {...prev, blue: !prev.blue}})} className="checkbox border-sky-400 checked:bg-sky-400 [--chkfg:black]" />
                    <input type="checkbox" checked={colorFilter.white} onClick={_ => setColorFilter(prev => {return {...prev, white: !prev.white}})} className="checkbox border-amber-200 checked:bg-amber-200 [--chkfg:black]" />
                    <input type="checkbox" checked={colorFilter.green} onClick={_ => setColorFilter(prev => {return {...prev, green: !prev.green}})} className="checkbox border-green-400 checked:bg-green-400 [--chkfg:black]" />
                    <input type="checkbox" checked={colorFilter.black} onClick={_ => setColorFilter(prev => {return {...prev, black: !prev.black}})} className="checkbox border-gray-500 checked:bg-gray-500 [--chkfg:black]" />
                </div>
                <button className="btn" onClick={() => router.push("/decks/newdeck")}>New Deck</button>
            </div>
        </div>
        {decks?.slice(0).reverse()
            .filter((deck: any) => 
                (deck[0]?.name + deck[1]?.name + deck[2]?.name +deck[3]?.name).toLowerCase().includes(searchValue.toLowerCase())
            && (deckInColors(deck[0]?.identityid))
            ).map((deck: any) => (
                <DeckCard key={deck[0].id}
                deckInfo={deck[0]} 
                commanderInfo={deck[1]}
                partnerInfo={deck[2]} companionInfo={deck[3]} 
                colorInfo={colors.find((c: any) => c.id === deck[0].identityid)}
                performanceInfo={performances?.filter((p: any) => p.deckid === deck[0].id)}
                ></DeckCard>
        ))}
    </div>
    );
}