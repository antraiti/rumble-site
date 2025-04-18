'use client'

import UserData from "@/app/util/UserData";
import { useEffect, useState } from "react";

async function getCardsStats(token: string, userid: number) {
    return fetch(`../../api/stats/cards`, {
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

async function getCardsFromList(token: string, decklist: string) {
    return fetch(`../../api/cards/fromdecklist`, {
    method: 'POST',
    body: JSON.stringify(decklist),
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

const convertToCSV = (objArray: any) => {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';

    for (let i = 0; i < array.length; i++) {
        let line = `"${array[i][1].card.name}","${array[i][1].card.typeline}",${array[i][1].count},${array[i][0]}`
        str += line + '\r\n';
    }
    return str;
};

const downloadCSV = (data: any) => {
    const csvData = new Blob([convertToCSV(data)], { type: 'text/csv' });
    const csvURL = URL.createObjectURL(csvData);
    const link = document.createElement('a');
    link.href = csvURL;
    link.download = `popular_cards.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export default function UnpopularChecker() {
    const {userToken, userName, userId} = UserData();
    const [cardSearch, setCardSearch] = useState<string>("");
    const [bannedCards, setBannedCards] = useState<Array<any>>([]);
    const [sortDir, setSortDir] = useState<boolean>(true);
    const [deckList, setDeckList] = useState("");
    const [bannedDecklistCards, setBannedDecklistCards] = useState<Array<any>>([]);

    useEffect(() => {
        getCardsStats(userToken, userId).then(items => {
            console.dir(items["cards"])
            const filteredCards: Array<any> = []
            items["cards"]
                .sort((a:any,b:any) => b[1]["count"]-a[1]["count"])
                .every((element: any) => {
                    if (element[1].card.typeline.indexOf("Basic") >= 0 || element[1].card.banned) return true;
                    if (filteredCards.length <= 300 || filteredCards[filteredCards.length-1][1].count == element[1].count) {
                        filteredCards.push(element);
                        return true;
                    }
                    else
                        return false;
            });
            setBannedCards(filteredCards);
        });
    }, []);

    function checkDecklist() {
        getCardsFromList(userToken, deckList).then(e => {
            const parsedBannedCards: Array<any> = []
            e.forEach((card: any) => {
                if (bannedCards.find(c => c[0] === card.id)) {
                    parsedBannedCards.push(card);
                }
            })
            setBannedDecklistCards(parsedBannedCards)
        }
        );
    }

    if (!userToken) return (<div>
            <div role="alert" className="alert alert-error mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-bold">Missing Token. You need to login to view this page.</span>
            </div>
        </div>)

    return (
        <div>
            <div className="card mx-auto bg-base-100 shadow-xl m-5 p-5 w-3/4 max-w-4xl">
                <h1 className="mx-auto font-bold text-2xl mb-2">Card Checker</h1>
                <p className="mx-auto">The following cards are too popular and are banned for unpopular night.</p>
                <div className="flex justify-center dropdown m-2 mx-auto w-full px-10">
                    <input value={cardSearch} type="text" placeholder="Search banned cards" 
                        className="input input-bordered grow max-w-md" 
                        onChange={(e: any) => {setCardSearch(e.target.value)}}
                    />
                </div>
                <table className="table bg-base-100 table-zebra h-64 overflow-y-auto">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th className="cursor-pointer" onClick={_ => setSortDir(prev => !prev)}>Games Played</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bannedCards?.sort((a:any,b:any) => sortDir ? b[1]["count"]-a[1]["count"] : a[1]["count"]-b[1]["count"])
                            .filter(c => cardSearch.length == 0 || c[1]["card"]["name"].toLowerCase().indexOf(cardSearch.toLowerCase()) >= 0)
                            .slice(0, 10)
                            .map((ustats: any) =>
                            {
                                return <tr key={ustats[0]}>
                                    <td>{ustats[1]["card"]["name"]}</td>
                                    <td>{ustats[1]["count"]}</td>
                                </tr>
                            })}
                    </tbody>
                </table>
                <p>Showing 10 of {bannedCards.length}</p>
                <button onClick={_ => downloadCSV(bannedCards)} className="btn btn-accent max-w-md mx-auto">Download CSV</button>
            </div>
            <div className="card mx-auto bg-base-100 shadow-xl m-5 p-5 w-3/4 max-w-4xl">
                <h1 className="mx-auto font-bold text-2xl mb-2">Decklist Check</h1>
                {bannedDecklistCards.length > 0 && bannedDecklistCards.map(bc => (
                    <div key={bc.name} role="alert" className="alert alert-error mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-bold">{bc.name} is too popular</span>
                    </div>
                ))}
                <textarea onChange={e => setDeckList(e.target.value)} className="textarea textarea-bordered mx-auto w-full m-5 max-w-m h-96" placeholder="Decklist..."/>
                <button onClick={_ => checkDecklist()} className="btn btn-accent max-w-md mx-auto">Check</button>
            </div>
        </div>
    );
}