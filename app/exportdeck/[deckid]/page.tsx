'use client'
import { use, useEffect, useState } from "react";
import userData from "../../util/UserData"
import { ttsCard, ttsCustomDeck, ttsDeck, ttsDeckCustom } from "@/models/tts/tts_deckmodel";
import { downloadImage, downloadJsonFile } from "@/app/util/utils";

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

async function getFavoritePrintings(token: string) {
    return fetch('/api/cards/printfavorite', {
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

async function setFavoritePrinting(token: string, cardid: string, printingid: string) {
    return fetch('/api/cards/printfavorite', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token
    },
    body: JSON.stringify({"card": cardid, "print": printingid})
    })
    .then(data => {
        if(data.status >= 400) {
            throw new Error("Server responds with error!");
        }
        return data.json();
    })
}

export interface DeckViewPageProps {
    deckid: number;
}

interface DeckCardPrinting {
    card: any;
    printingid: string;
    printing: string;
}

interface FavoritePrinting {
    id: number;
    userid: number;
    cardid: string;
    printingid: string;
}

export default function DeckDetails({ params }: { params: Promise<DeckViewPageProps>}) {
    const {deckid} = use(params);
    const { userToken } = userData();

    const [deckData, setDeckData] = useState<any | null>();
    const [cards, setCards] = useState<any[]>([]);
    const [printings, setPrintings] = useState<any[]>([]);
    const [favoritePrintings, setFavoritePrintings] = useState<FavoritePrinting[]>([]);
    const [tokens, setTokens] = useState<any[]>([]);
    const [selectedCard, setSelectedCard] = useState<any>();
    const [cardPrintings, setCardPrintings] = useState<Map<string, DeckCardPrinting>>(new Map<string, DeckCardPrinting>());
    const [cardBack, setCardBack] = useState<string>("https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg");

    useEffect(() => {
        const cardbackInput = document.getElementById('cardback-url')! as HTMLInputElement;
        cardbackInput.addEventListener('focus', function() {
            this.select();
        });
    })

    function updateFavorites() {
        getFavoritePrintings(userToken).then((e: Array<FavoritePrinting>) => {
            setFavoritePrintings(e);
        })
    }

    const downloadDeck = () => {
        let logString = "";
        const tDeck: ttsDeck = new ttsDeck(); // Top level object
        const tDCustom: ttsDeckCustom = new ttsDeckCustom(); //Main deck object for cards
        tDeck.ObjectStates.push(tDCustom);

        let counter: number = 2;
        let rightCounter: number = 1;
        let leftCounter: number = -1;

        const sideboardCards: ttsCard[] = []
        const tokenCards: ttsCard[] = []
        const commanderCards: ttsCard[] = []

        Array.from(cardPrintings.values()).forEach((cp: DeckCardPrinting) => {
            if ((cp.card[1].id as string).endsWith("/back")) return; //skip card backs
            logString += `Processing: ${cp.card[1].id}`

            for (let i = 0; i < cp.card[0].count; i++) {
                const stringId: string = counter.toString();
                const numId: number = counter * 100; //i hate TTS

                //make new ttsCustomDeck object
                const tCDeck: ttsCustomDeck = new ttsCustomDeck();
                tCDeck.FaceURL = cp.printing;
                tCDeck.BackURL = cardBack;

                //make new ttsCard object with custdeck on it
                const tCard: ttsCard = new ttsCard();
                tCard.Nickname = `${cp.card[1].name} \n${cp.card[1].typeline}`;
                tCard.Description = cp.card[1].oracletext;
                tCard.CardID = numId;
                tCard.CustomDeck[stringId] = tCDeck;

                if (cp.card[1].transform) {
                    const tBackCardPrint: DeckCardPrinting = cardPrintings.get(cp.card[1].id + "/back")!;
                    counter++;
                    const backStringId: string = counter.toString();
                    const backNumId: number = counter * 100;

                    const tBackCDeck: ttsCustomDeck = new ttsCustomDeck();
                    tBackCDeck.FaceURL = tBackCardPrint.printing;
                    tBackCDeck.BackURL = cardBack;

                    const tBackCard: ttsCard = new ttsCard();
                    tBackCard.Nickname = `${tBackCardPrint.card[1].name} \n${tBackCardPrint.card[1].typeline}`;
                    tBackCard.Description = tBackCardPrint.card[1].oracletext;
                    tBackCard.CardID = backNumId;
                    tBackCard.CustomDeck[backStringId] = tBackCDeck;

                    tCard.States["2"] = tBackCard;
                }

                if (cp.card[0].iscommander === true) {
                    commanderCards.unshift(tCard);
                } else if (cp.card[0].iscompanion === true) {
                    commanderCards.push(tCard);
                } else if (cp.card[0].issideboard === true) {
                    sideboardCards.push(tCard);
                } else if (cp.card[0].istoken == true) {
                    tokenCards.push(tCard);
                } else {
                    //add id to DeckIDs
                    tDCustom.DeckIDs.push(numId);

                    //add ttsCustomDeck to decks CustomDeck
                    tDCustom.CustomDeck[stringId] = tCDeck;

                    //add card to deck
                    tDCustom.ContainedObjects.push(tCard);
                }

                counter++;
            }
        })

        //Add in commander and sideboard cards
        commanderCards.forEach(c => {
            c.Transform.posX = rightCounter * 2.5;
            c.Transform.rotZ = 0;
            tDeck.ObjectStates.push(c);
            rightCounter++;
        });

        if (sideboardCards.length > 0) {
            const tDCSideboard: ttsDeckCustom = new ttsDeckCustom();
            tDCSideboard.Transform.rotZ = 0;
            tDCSideboard.Transform.posX = leftCounter * 2.5;
            leftCounter--;
            tDeck.ObjectStates.push(tDCSideboard);
            sideboardCards.forEach(c => {
                c.Transform.rotZ = 0;
                tDCSideboard.DeckIDs.push(c.CardID);
                tDCSideboard.CustomDeck[(c.CardID/100).toString()] = c.CustomDeck[(c.CardID/100).toString()];
                tDCSideboard.ContainedObjects.push(c);
            })
        }

        if (tokenCards.length > 0) {
            const tDCToken: ttsDeckCustom = new ttsDeckCustom();
            tDCToken.Transform.rotZ = 0;
            tDCToken.Transform.posX = leftCounter * 2.5;
            leftCounter--;
            tDeck.ObjectStates.push(tDCToken);
            tokenCards.forEach(c => {
                c.Transform.rotZ = 0;
                tDCToken.DeckIDs.push(c.CardID);
                tDCToken.CustomDeck[(c.CardID/100).toString()] = c.CustomDeck[(c.CardID/100).toString()];
                tDCToken.ContainedObjects.push(c);
            })
        }

        downloadJsonFile(JSON.stringify(tDeck, null, 4), deckData?.deck.name);
        (document?.getElementById('export_info') as any).showModal();
    }

    useEffect(() => {
        getFavoritePrintings(userToken).then((e: Array<FavoritePrinting>) => {
            setFavoritePrintings(e)

            getDeckInfo(userToken, deckid).then((item) => {
                console.log(item)

                setDeckData(item);
                setPrintings(item.printings)
                setTokens(item.tokens)
                item.tokens.map((token: any) => {
                    const favoritePrint = e.find((p: FavoritePrinting) => p.cardid == token)
                    const printing = favoritePrint ? item.printings.find((p: any) => p.id == favoritePrint.printingid) : item.printings.find((p: any) => p.cardid == token)
                    cardPrintings.set(token, {
                        card: [{id: token, count: 1, istoken: true}, {id: token, name: "token", oracletext: "sorry i didnt setup this info"}],
                        printing: printing.cardimage,
                        printingid: printing.id
                    })
                })

                setCards([]);
                item.cardlist.map((card: any) => {
                    const favoritePrint = e.find((p: FavoritePrinting) => p.cardid == card[0].cardid)
                    if(favoritePrint) console.log(favoritePrint)
                    const printing = favoritePrint ? item.printings.find((p: any) => p.id == favoritePrint.printingid) : item.printings.find((p: any) => p.cardid == card[1].id)
                    cardPrintings.set(card[0].cardid, {
                        card: card,
                        printing: printing.cardimage,
                        printingid: printing.id
                    })
                    setCards(prev => [...prev, card])
                    if (card[1].transform) {
                        const backcard = item.cardbacks.find((cb: any) => cb.id == card[0].cardid+"/back");
                        const favoritePrint = e.find((p: FavoritePrinting) => p.cardid == backcard.id)
                        const printing = favoritePrint ? item.printings.find((p: any) => p.id == favoritePrint.printingid) : item.printings.find((p: any) => p.cardid == backcard.id)
                        setCards(prev => [...prev, [{}, backcard]])
                        cardPrintings.set(backcard.id, {
                            card: [{}, backcard],
                            printing: printing.cardimage,
                            printingid: printing.id
                        })
                    }
                })
            });
        })
      }, [])

    
    function CardDisplay(card: any) {
        const favorited: boolean = favoritePrintings.find(e => e.printingid == cardPrintings.get(card[1].id)?.printingid) != null
        return (
            <div 
                className="hover-3d group cursor-pointer w-75 relative" 
                key={card[1].id}
            >
                <figure 
                    className="max-w-100 rounded-2xl" 
                >
                    <div 
                        className="absolute w-12 h-12 bg-gray-800/0 hover:bg-gradient-to-br from-gray-800/90 to-gray-800/0 p-2 hover:p-1"
                        title={favorited ? "Remove from favorites" : "Add to favorites"}
                        onClick={()=> {favorited ? setFavoritePrinting(userToken, card[1].id, "").then(_ => updateFavorites()) : setFavoritePrinting(userToken, card[1].id, cardPrintings.get(card[1].id)?.printingid ?? "").then(_ => updateFavorites())}}
                    >
                        {
                        favorited
                        ?
                        <svg className="hidden group-hover:block" fill="#ffee00" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1915.918 737.475c-10.955-33.543-42.014-56.131-77.364-56.131h-612.029l-189.063-582.1v-.112C1026.394 65.588 995.335 43 959.984 43c-35.237 0-66.41 22.588-77.365 56.245L693.443 681.344H81.415c-35.35 0-66.41 22.588-77.365 56.131-10.955 33.544.79 70.137 29.478 91.03l495.247 359.831-189.177 582.212c-10.955 33.657 1.13 70.25 29.817 90.918 14.23 10.278 30.946 15.487 47.66 15.487 16.716 0 33.432-5.21 47.775-15.6l495.134-359.718 495.021 359.718c28.574 20.781 67.087 20.781 95.662.113 28.687-20.668 40.658-57.261 29.703-91.03l-189.176-582.1 495.36-359.83c28.574-20.894 40.433-57.487 29.364-91.03" fillRule="evenodd"/>
                        </svg>
                        :
                        <svg className="hidden group-hover:block" fill="#ffffff" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1306.181 1110.407c-28.461 20.781-40.32 57.261-29.477 91.03l166.136 511.398-435.05-316.122c-28.686-20.781-67.086-20.781-95.66 0l-435.05 316.122 166.25-511.623c10.842-33.544-1.017-70.024-29.591-90.805L178.577 794.285h537.825c35.351 0 66.523-22.701 77.365-56.245l166.25-511.51 166.136 511.397a81.155 81.155 0 0 0 77.365 56.358h537.939l-435.276 316.122Zm609.77-372.819c-10.956-33.656-42.014-56.244-77.365-56.244h-612.141l-189.064-582.1C1026.426 65.589 995.367 43 960.017 43c-35.351 0-66.523 22.588-77.365 56.245L693.475 681.344H81.335c-35.351 0-66.41 22.588-77.366 56.244-10.842 33.657 1.017 70.137 29.591 90.918l495.247 359.718-189.29 582.211c-10.842 33.657 1.017 70.137 29.704 90.918 14.23 10.39 31.059 15.586 47.661 15.586 16.829 0 33.657-5.195 47.887-15.699l495.248-359.718 495.02 359.718c28.575 20.894 67.088 20.894 95.775.113 28.574-20.781 40.433-57.261 29.59-91.03l-189.289-582.1 495.247-359.717c28.687-20.781 40.546-57.261 29.59-90.918Z" fillRule="evenodd"/>
                        </svg>
                    }
                    </div>
                    <img 
                        src={cardPrintings.get(card[1].id)?.printing} 
                        alt="3D card"
                        onClick={()=> {setSelectedCard(card); (document?.getElementById('card_style_selector') as any).showModal();}}
                    />
                </figure>
            </div>
        )
    }

    function UpdatePrinting(card: any, newPrint: string, newPrintId: string) {
        const cardPrints: Map<string, DeckCardPrinting> = new Map(cardPrintings);
        if (cardPrintings.has(card[1].id)) { //this should always be true
            const oldPrinting = cardPrintings.get(card[1].id)!
            cardPrints.set(card[1].id, {
                card: oldPrinting.card,
                printing: newPrint,
                printingid: newPrintId
            })
        } else {
            cardPrints.set(card[1].id, {
                card: card,
                printing: newPrint,
                printingid: newPrintId
            })
        }
        setCardPrintings(cardPrints);
    }

    return(
    <div className="mx-auto m-5 p-5 max-w-7xl">
        <div className="flex items-center justify-between">
            <h1 className="text-4xl italic font-bold">{deckData ? deckData?.deck.name : "loading"}</h1>
            <div className="flex">
                <div className="flex flex-col">
                    <h1 className="text-center w-full">Card Back</h1>
                    <input 
                        type="text"
                        id="cardback-url"
                        placeholder="Cardback URL" 
                        className="input input-bordered max-w-m" 
                        value={cardBack} 
                        onChange={e => {setCardBack(e.target.value);}}
                    />
                </div>
                <img className="h-24 px-5 object-contain" src={cardBack}/>
            </div>
            <div className="flex gap-2">
                <div className="tooltip" data-tip="Copy Decklist to Clipboard">
                    <button className="btn btn-primary" onClick={() => downloadDeck()}>Download TTS</button>
                </div>
            </div>
        </div>
        <div className="pt-5">
            <h1 className="text-xl">Commander / Companion</h1>
            <div className="grid grid-cols-4 gap-4">
                {cards.filter(c => c[0].iscommander || c[0].iscompanion).map(c => CardDisplay(c))}
            </div>
        </div>
        <div className="pt-5">
            <h1 className="text-xl">Deck</h1>
            <div className="grid grid-cols-4 gap-4">
                {cards.filter(c => !c[0].iscommander && !c[0].iscompanion && !c[0].issideboard).map(c => CardDisplay(c))}
            </div>
        </div>
        {cards.filter(c => c[0].issideboard).length > 0 && <div className="pt-5">
            <h1 className="text-xl">Sideboard</h1>
            <div className="grid grid-cols-4 gap-4">
                {cards.filter(c => c[0].issideboard).map(c => CardDisplay(c))}
            </div>
        </div>}
        {tokens.length > 0 && <div className="pt-5">
            <h1 className="text-xl">Tokens</h1>
            <div className="grid grid-cols-4 gap-4">
                {tokens.map(c => CardDisplay([{}, {id:c}]))}
            </div>
        </div>}

        <dialog id="card_style_selector" className="modal">
            {selectedCard && <div className="modal-box w-11/12 max-w-5xl max-h-3/4 pt-18">
                <form method="dialog">
                    <h1 className="absolute left-6 top-6 text-xl italic font-bold">{selectedCard[1].name}</h1>
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <div className="grid grid-cols-4 gap-4">
                    {printings.filter(p => p.cardid == selectedCard[1].id).map(printing => {
                        return (
                            <div 
                                className="hover-3d cursor-pointer"
                                key={printing.cardimage}
                                onClick={_ => {UpdatePrinting(selectedCard, printing.cardimage, printing.id); (document?.getElementById('card_style_selector') as any).close()}}
                            >
                                <figure className="max-w-100 rounded-2xl">
                                    <img src={printing.cardimage} alt="3D card" />
                                </figure>
                            </div>
                        )
                    })}
                </div>
            </div>}
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>

        <dialog id="export_info" className="modal">
            <div className="modal-box max-h-3/4 pt-18">
                <form method="dialog">
                    <h1 className="absolute left-6 top-6 text-xl italic font-bold">{deckData?.deck.name}</h1>
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <div className="flex flex-col h-72 gap-5">
                    <h1 className="text-center text-xl">{`Your deck has been downloaded and just needs to be moved to your Tabletop Simulator saves folder`}</h1> 
                    <h1 className="text-center text-sm">{`...\\Documents\\My Games\\Tabletop Simulator\\Saves\\Saved Objects`}</h1>
                    <h1 className="pt-6 text-center text-2xl">Dont Forget To Download an Image</h1>
                    <h1 className="text-center text-sm">{`TTS uses image files alongside the json for the icons in the ingame browser. It needs to be alongside the deck json and have the same name.`}</h1>
                    <button className="btn" onClick={_ => {
                        downloadImage(cardBack, deckData?.deck.name + ".png");
                    }
                    }>Download Cardback Image</button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    </div>);
}