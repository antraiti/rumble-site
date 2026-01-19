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

export interface DeckViewPageProps {
    deckid: number;
}

interface DeckCardPrinting {
    card: any;
    printing: string;
}

export default function DeckDetails({ params }: { params: Promise<DeckViewPageProps>}) {
    const {deckid} = use(params);
    const { userToken } = userData();

    const [deckData, setDeckData] = useState<any | null>();
    const [cards, setCards] = useState<any[]>([]);
    const [printings, setPrintings] = useState<any[]>([]);
    const [selectedCard, setSelectedCard] = useState<any>();
    const [cardPrintings, setCardPrintings] = useState<Map<string, DeckCardPrinting>>(new Map<string, DeckCardPrinting>());
    const [cardBack, setCardBack] = useState<string>("https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg");

    useEffect(() => {
        const cardbackInput = document.getElementById('cardback-url')! as HTMLInputElement;
        cardbackInput.addEventListener('focus', function() {
            this.select();
        });
    })

    const downloadDeck = () => {
        let logString = "";
        const tDeck: ttsDeck = new ttsDeck(); // Top level object
        const tDCustom: ttsDeckCustom = new ttsDeckCustom(); //Main deck object for cards
        tDeck.ObjectStates.push(tDCustom);

        let counter: number = 2;
        let rightCounter: number = 1;
        let leftCounter: number = -1;

        const sideboardCards: ttsCard[] = []
        const commanderCards: ttsCard[] = []

        Array.from(cardPrintings.values()).forEach((cp: DeckCardPrinting) => {
            if ((cp.card[1].id as string).endsWith("/back")) return; //skip card backs
            logString += `Processing: ${cp.card[1].id}`

            /**
             * 
             * TODO: fetch token data if possible
             */

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

        downloadJsonFile(JSON.stringify(tDeck, null, 4), deckData?.deck.name);
        (document?.getElementById('export_info') as any).showModal();
    }

    useEffect(() => {
        getDeckInfo(userToken, deckid).then((item) => {
            console.log(item)

            setDeckData(item);
            setPrintings(item.printings)

            setCards([]);
            item.cardlist.map((card: any) => {
                cardPrintings.set(card[0].cardid, {
                    card: card,
                    printing: item.printings.find((p: any) => p.cardid == card[1].id)?.cardimage
                })
                setCards(prev => [...prev, card])
                if (card[1].transform) {
                    const backcard = item.cardbacks.find((cb: any) => cb.id == card[0].cardid+"/back");
                    setCards(prev => [...prev, [{}, backcard]])
                    cardPrintings.set(backcard.id, {
                        card: [{}, backcard],
                        printing: item.printings.find((p: any) => p.cardid == backcard.id)?.cardimage
                    })
                }
            })
        });
      }, [])

    
    function CardDisplay(card: any) {
        return (
            <div 
                className="hover-3d cursor-pointer" 
                key={card[1].id}
                onClick={()=> {setSelectedCard(card); (document?.getElementById('card_style_selector') as any).showModal();}}
            >
                <figure className="max-w-100 rounded-2xl">
                    <img src={cardPrintings.get(card[1].id)?.printing} alt="3D card" />
                </figure>
            </div>
        )
    }

    function UpdatePrinting(card: any, newPrint: string) {
        const cardPrints: Map<string, DeckCardPrinting> = new Map(cardPrintings);
        cardPrints.set(card[1].id, {
            card: card,
            printing: newPrint
        })
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
            <div className="grid grid-cols-4 gap-4">
                {cards.map(c => CardDisplay(c))}
            </div>
        </div>

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
                                onClick={_ => {UpdatePrinting(selectedCard, printing.cardimage); (document?.getElementById('card_style_selector') as any).close()}}
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