'use client'

import { useState } from "react";

async function getCheckResult(decklist: string) {
    return fetch(`../../api/deck/checker`, {
    method: 'POST',
    body: JSON.stringify(decklist),
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
    }})
    .then(data => {
        if(data.status >= 400) {
            throw new Error("Server responds with error!");
        }
        return data.json();
    })
}

export default function Checker() {
    const [deckList, setDeckList] = useState("");
    const [bannedDecklistCards, setBannedDecklistCards] = useState<Array<any> | undefined>();

    function checkDecklist() {
        getCheckResult(deckList).then(e => {
            setBannedDecklistCards(e.bannedCards)
        }
        );
    }

    return (
        <div>
            <div className="card mx-auto bg-base-100 shadow-xl m-5 p-5 w-3/4 max-w-4xl">
                <h1 className="mx-auto font-bold text-2xl mb-2">Decklist Check</h1>
                <p className="mx-auto pb-5">Input a decklist to check if it contains any banned cards. Currently does not check for other legality issues.</p>
                {bannedDecklistCards != undefined && (bannedDecklistCards.length > 0 ? bannedDecklistCards.map(bc => (
                    <div key={bc.name} role="alert" className="alert alert-error mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-bold">{bc.name} is Banned</span>
                    </div>
                )) : 
                    <div role="alert" className="alert alert-success mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-bold">No banned cards found.</span>
                    </div>
                )}
                <textarea onChange={e => setDeckList(e.target.value)} className="textarea textarea-bordered mx-auto w-full m-5 max-w-m h-96" placeholder="Decklist..."/>
                <button onClick={_ => checkDecklist()} className="btn btn-accent max-w-md mx-auto">Check</button>
            </div>
        </div>
    );
}