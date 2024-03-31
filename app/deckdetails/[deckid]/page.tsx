'use client'
import { useEffect, useState } from "react";
import userData from "../../util/UserData"
import { useRouter } from "next/navigation";

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

  async function updateDeck(token: string, id: number, prop: string, val: string) {
    return fetch('/api/deck/'+id, {
    method: 'PUT',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token
    },
    body: JSON.stringify({'prop': prop, 'val': val})
    })
    .then((data: any) => {
        if(data.status >= 400) {
            throw new Error(data.message);
        }
        return data.json();
    })
  }

  async function sendDeleteDeckRequest(token: string, id: number) {
    return fetch('/api/deck/remove/'+id, {
    method: 'PUT',
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


export default function DeckDetails({ params }: { params: { deckid: number }}) {
    const { userToken } = userData();
    const router = useRouter();
    const [deckInfo, setDeckInfo] = useState<any | null>();
    const [deckName, setDeckName] = useState(""); //splitting out these properties is bad and can be done
    const [deckCommander, setDeckCommander] = useState();
    const [deckPartner, setDeckPartner] = useState();
    const [deckCompanion, setDeckCompanion] = useState();
    const [cardList, setCardList] = useState<any | null>([]);
    const [deckLegality, setDeckLegality] = useState();
    const [deckLegalityMessages, setDeckLegalityMessages] = useState([]);
    const [deckPerformances, setDeckPerformances] = useState([""]);
    const [ctimer, setCtimer] = useState<any | null>(null);
    const [printingList, setPrintingList] = useState<any | null>([]);

    useEffect(() => {
        fetchDeckInfo();
    },[])

    function fetchDeckInfo() {
        getDeckInfo(userToken, params.deckid).then((item) => {
            setDeckInfo(item.deck);
            setDeckName(item.deck.name);
            setDeckCommander(item.deck.commander);
            setDeckPartner(item.deck.partner);
            setDeckCompanion(item.deck.companion);
            setCardList(item.cardlist);
            setDeckLegality(item.legality.legal);
            setDeckLegalityMessages(item.legality.messages);
            setDeckPerformances(item.performances);
            setPrintingList(item.printings);
            console.log(item);
        });
    }

    function sendDeckUpdate(prop: string, val: string) {
        updateDeck(userToken, params.deckid, prop, val).then(() => {
            fetchDeckInfo();
        })
    }

    function deleteDeck() {
        sendDeleteDeckRequest(userToken, params.deckid).then(() => {
            router.push("/decks");
        });
    }

    function changeDelay(prop: string, val: string) {
        if (ctimer) {
          clearTimeout(ctimer);
          setCtimer(null);
        }
        setCtimer(
          setTimeout(() => {
            updateDeck(userToken, params.deckid, prop, val);
          }, 500)
        );
    }

    return (
        <div className="bg-base-200 h-full">
            <div className="flex justify-items-center max-w-7xl m-3 mx-auto">
            {!deckLegality && deckLegalityMessages && deckLegalityMessages.map((mes) => (
                        <div role="alert" className="alert alert-error mx-auto m-3" key={mes}>Alert: {mes}</div>
                    ))}
                <div className="flex justify-between">
                    <div className="card flex flex-col justify-start items-center shadow-xl bg-primary p-5 m-5 w-full">
                        <h1 className="pb-5">Deck Image</h1>
                        <img className="pb-5" src={deckInfo?.image}/>
                        <div className="grid bg-base-200 grid-cols-2 overflow-y-scroll p-5 max-h-96">
                            {printingList?.map((p: any) => {return <button key={p.artcrop} className="btn h-full" onClick={e => sendDeckUpdate("image", p.artcrop)}><img className="w-full p-1" src={p.artcrop}/></button>})}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col justify-start w-full">
                    <div className="card flex flex-col justify-center items-center shadow-xl bg-primary p-5 m-5 w-full">
                        <h1>Deck</h1>
                        <input type="text" placeholder="Deck Name" className="input input-bordered w-full m-5 max-w-m" value={deckName} onChange={e => {setDeckName(e.target.value); changeDelay("name", e.target.value);}}/>
                        <select className="select select-bordered w-full m-5 max-w-m" value={deckCommander ?? undefined} onChange={e => sendDeckUpdate("commander", e.target.value)}>
                            <option disabled selected>Commander</option>
                            {cardList.filter((c: any)=> c[1].typeline?.includes("Legendary") && (c[1].typeline?.includes("Creature") || c[1].typeline?.includes("Planeswalker"))).map((card: any) => 
                                    <option key={card[0].cardid} value={card[0].cardid}>{card[1].name}</option>
                                    )}
                        </select>
                        <select className="select select-bordered w-full m-5 max-w-m" value={deckPartner ?? undefined} onChange={e => sendDeckUpdate("partner", e.target.value)}>
                            <option disabled selected>Partner</option>
                            {cardList.filter((c: any)=> c[1].typeline?.includes("Legendary") && (c[1].typeline?.includes("Creature") || c[1].typeline?.includes("Planeswalker"))).map((card: any) => 
                                    <option key={card[0].cardid} value={card[0].cardid}>{card[1].name}</option>
                                    )}
                        </select>
                        <select className="select select-bordered w-full m-5 max-w-m" value={deckCompanion ?? undefined} onChange={e => sendDeckUpdate("companion", e.target.value)}>
                            <option disabled selected>Companion</option>
                            {cardList.filter((c: any)=> c[1].typeline?.includes("Legendary") && (c[1].typeline?.includes("Creature") || c[1].typeline?.includes("Planeswalker"))).map((card: any) => 
                                    <option key={card[0].cardid} value={card[0].cardid}>{card[1].name}</option>
                                    )}
                        </select>
                    </div>
                    <div className="card flex flex-col justify-center items-center shadow-xl bg-primary p-5 m-5 w-full">
                        <h1>Sideboard</h1>
                        <select className="select select-bordered w-full m-5 max-w-m" onChange={e => sendDeckUpdate("sideboard", e.target.value)}>
                            <option disabled selected>Add Card</option>
                            {cardList.map((card: any) => 
                                    <option key={card[0].cardid} value={card[0].cardid}>{card[1].name}</option>
                                    )}
                        </select>
                        <div className="grid grid-cols-1 md:grid-cols-2 w-full">
                            {cardList.filter((card: any) => card[0].issideboard).map((card: any) => 
                                    <div key={card[0].cardid} className="card flex justify-between flex-row items-center bg-accent h-10 m-2 w-72">
                                        <h1 className="mx-5">{card[1].name}</h1>
                                        <button className="btn btn-error btn-outline btn-sm" onClick={e => sendDeckUpdate("-sideboard", card[0].cardid)}>x</button>
                                    </div>
                                    )}
                        </div>
                    </div>
                    {deckPerformances.length == 0 && <button onClick={() => deleteDeck()} className="btn btn-error shadow-xl mx-auto max-w-md">Delete Deck</button>}
                </div>
            </div>
        </div>
    );
}
