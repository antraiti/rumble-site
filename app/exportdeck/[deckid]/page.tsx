'use client'
import { use, useEffect, useState } from "react";
import userData from "../../util/UserData"
import { ttsCard, ttsCustomDeck, ttsDeck, ttsDeckCustom } from "@/models/tts/tts_deckmodel";
import { downloadImage, downloadJsonFile } from "@/app/util/utils";
import { apiGet, apiPost } from "@/app/util/apiClient";
import { DeckName, useDeckName } from "@/app/components/DemoMode";
import PageHeader from "@/app/components/PageHeader";
import Link from "next/link";

type ExportEntry = { cardid?: string; count?: number; iscommander?: boolean; iscompanion?: boolean; issideboard?: boolean; istoken?: boolean; id?: string };
type ExportCard = { id: string; name?: string; typeline?: string; oracletext?: string; transform?: boolean };
type ExportRow = [ExportEntry, ExportCard];
type Printing = { id: string; cardid: string; cardimage: string };
type ExportDeckResponse = {
    deck: { id: number; name: string; commander: string | null; partner: string | null; lastupdated?: string | null };
    cardlist: ExportRow[] | null;
    printings: Printing[] | null;
    tokens: string[] | null;
    cardbacks: ExportCard[] | null;
};

async function getDeckInfo(token: string, id: number) {
    return apiGet<ExportDeckResponse>(`deck/${id}`, { token });
}

async function getFavoritePrintings(token: string) {
    return apiGet<FavoritePrinting[]>('cards/printfavorite', { token });
}

async function setFavoritePrinting(token: string, cardid: string, printingid: string) {
    return apiPost('cards/printfavorite', { token, body: {"card": cardid, "print": printingid} });
}

const dialog = (id: string) => document.getElementById(id) as HTMLDialogElement | null;

export interface DeckViewPageProps {
    deckid: number;
}

interface DeckCardPrinting {
    card: ExportRow;
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

    const [deckData, setDeckData] = useState<ExportDeckResponse | null>(null);
    const [cards, setCards] = useState<ExportRow[]>([]);
    const [printings, setPrintings] = useState<Printing[]>([]);
    const [favoritePrintings, setFavoritePrintings] = useState<FavoritePrinting[]>([]);
    const [tokens, setTokens] = useState<string[]>([]);
    const [selectedCard, setSelectedCard] = useState<ExportRow>();
    const [cardPrintings, setCardPrintings] = useState<Map<string, DeckCardPrinting>>(new Map<string, DeckCardPrinting>());
    const [cardBack, setCardBack] = useState<string>("https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg");
    const [loadError, setLoadError] = useState(false);
    const deckName = useDeckName();
    const commanderNames = deckData
        ? [deckData.deck.commander, deckData.deck.partner].map(id => deckData.cardlist?.find(card => card[1].id === id)?.[1].name)
        : [];
    const displayName = deckData ? deckName(deckData.deck, commanderNames) : "";

    function updateFavorites() {
        if (!userToken) return;
        getFavoritePrintings(userToken).then((e: Array<FavoritePrinting>) => {
            setFavoritePrintings(e);
        }).catch(() => {
            setFavoritePrintings([]);
        });
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

            for (let i = 0; i < (cp.card[0].count ?? 0); i++) {
                const stringId: string = counter.toString();
                const numId: number = counter * 100; //i hate TTS

                //make new ttsCustomDeck object
                const tCDeck: ttsCustomDeck = new ttsCustomDeck();
                tCDeck.FaceURL = cp.printing;
                tCDeck.BackURL = cardBack;

                //make new ttsCard object with custdeck on it
                const tCard: ttsCard = new ttsCard();
                tCard.Nickname = `${cp.card[1].name} \n${cp.card[1].typeline}`;
                tCard.Description = cp.card[1].oracletext ?? "";
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
                    tBackCard.Description = tBackCardPrint.card[1].oracletext ?? "";
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

        downloadJsonFile(JSON.stringify(tDeck, null, 4), displayName);
        dialog('export_info')?.showModal();
    }

    useEffect(() => {
        const favoritesRequest = userToken
            ? getFavoritePrintings(userToken).catch(() => [] as FavoritePrinting[])
            : Promise.resolve([] as FavoritePrinting[]);

        favoritesRequest.then((e: Array<FavoritePrinting>) => {
            setFavoritePrintings(e)

            getDeckInfo(userToken, deckid).then((item) => {
                const itemPrintings = item.printings ?? [];
                setDeckData(item);
                setPrintings(itemPrintings)
                setTokens(item.tokens ?? [])
                ;(item.tokens ?? []).forEach(token => {
                    const favoritePrint = e.find((p: FavoritePrinting) => p.cardid == token)
                    const printing = favoritePrint ? itemPrintings.find(p => p.id == favoritePrint.printingid) : itemPrintings.find(p => p.cardid == token)
                    if (!printing) console.warn("no printing found for token " + token)
                    cardPrintings.set(token, {
                        card: [{id: token, count: 1, istoken: true}, {id: token, name: "token", oracletext: "sorry i didnt setup this info"}],
                        printing: printing?.cardimage ?? "",
                        printingid: printing?.id ?? ""
                    })
                })

                setCards([]);
                ;(item.cardlist ?? []).forEach(card => {
                    const favoritePrint = e.find((p: FavoritePrinting) => p.cardid == card[0].cardid)
                    const printing = favoritePrint ? itemPrintings.find(p => p.id == favoritePrint.printingid) : itemPrintings.find(p => p.cardid == card[1].id)
                    cardPrintings.set(card[1].id, {
                        card: card,
                        printing: printing?.cardimage ?? "",
                        printingid: printing?.id ?? ""
                    })
                    setCards(prev => [...prev, card])
                    if (card[1].transform) {
                        const backcard = item.cardbacks?.find(cb => cb.id == card[1].id + "/back");
                        //const favoritePrint = e.find((p: FavoritePrinting) => p.cardid == backcard.id)
                        if (!backcard) {
                            console.warn("no back card found for " + card[0].cardid)
                            return
                        }
                        const printing = favoritePrint ? itemPrintings.find(p => p.id == favoritePrint.printingid) : itemPrintings.find(p => p.cardid == backcard.id)
                        if (!printing) console.warn("no printing found for card back " + backcard.id)
                        setCards(prev => [...prev, [{}, backcard]])
                        cardPrintings.set(backcard.id, {
                            card: [{}, backcard],
                            printing: printing?.cardimage ?? "",
                            printingid: printing?.id ?? ""
                        })
                    }
                })
            }).catch(() => setLoadError(true));
                })
            }, [deckid, userToken])

    
    function CardDisplay(card: ExportRow) {
        const favorited: boolean = favoritePrintings.find(e => e.printingid == cardPrintings.get(card[1].id)?.printingid) != null
        return (
            <div 
                className="hover-3d group relative w-full cursor-pointer" 
                key={card[1].id}
            >
                <figure 
                    className="max-w-100 rounded-2xl" 
                >
                    {userToken && <button
                        type="button"
                        className="absolute w-12 h-12 bg-gray-800/0 hover:bg-gradient-to-br from-gray-800/90 to-gray-800/0 p-2 hover:p-1"
                        title={favorited ? "Remove from favorites" : "Add to favorites"}
                        aria-label={`${favorited ? "Remove" : "Save"} ${card[1].name ?? "card"} printing ${favorited ? "from" : "as"} favorite`}
                        onClick={()=> {
                            const request = favorited
                                ? setFavoritePrinting(userToken, card[1].id, "")
                                : setFavoritePrinting(userToken, card[1].id, cardPrintings.get(card[1].id)?.printingid ?? "");
                            request.then(() => updateFavorites()).catch(() => undefined);
                        }}
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
                    </button>}
                    <img 
                        src={cardPrintings.get(card[1].id)?.printing} 
                        alt={card[1].name ? `${card[1].name}, click to choose a printing` : "Token, click to choose a printing"}
                        onClick={()=> {setSelectedCard(card); dialog('card_style_selector')?.showModal();}}
                    />
                </figure>
            </div>
        )
    }

    function UpdatePrinting(card: ExportRow, newPrint: string, newPrintId: string) {
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

    if (loadError) {
        return (
            <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
                <div role="alert" className="alert alert-error">Couldn&apos;t load this deck. Try refreshing the page.</div>
            </main>
        );
    }

    if (!deckData) {
        return (
            <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8" aria-busy="true">
                <div className="skeleton h-24 w-full" />
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{[0, 1, 2, 3].map(index => <div key={index} className="skeleton aspect-[5/7] w-full" />)}</div>
            </main>
        );
    }

    const gridClass = "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4";

    return(
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
        <PageHeader
            eyebrow="Rumble / Deck / Export"
            title={<DeckName deck={deckData.deck} commanders={commanderNames} />}
            actions={<>
                <button type="button" className="btn btn-primary" onClick={() => downloadDeck()}>Download for TTS</button>
                <Link href={`/deck/${deckid}`} className="btn btn-outline">Back to deck</Link>
            </>}
        >
            Click a card to pick its printing.{userToken ? " Star a printing to use it by default in every deck." : ""}
        </PageHeader>
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-box bg-base-100 p-4 shadow-sm">
            <img className="h-24 object-contain" src={cardBack} alt="Card back preview" />
            <label className="floating-label min-w-64 flex-1">
                <span>Card back image URL</span>
                <input 
                    type="url"
                    id="cardback-url"
                    placeholder="Card back image URL" 
                    className="input w-full" 
                    value={cardBack} 
                    onFocus={e => e.currentTarget.select()}
                    onChange={e => {setCardBack(e.target.value);}}
                />
            </label>
        </div>
        <section className="pt-8">
            <h2 className="mb-3 text-xl font-bold">Commander / Companion</h2>
            <div className={gridClass}>
                {cards.filter(c => c[0].iscommander || c[0].iscompanion).map(c => CardDisplay(c))}
            </div>
        </section>
        <section className="pt-8">
            <h2 className="mb-3 text-xl font-bold">Deck</h2>
            <div className={gridClass}>
                {cards.filter(c => !c[0].iscommander && !c[0].iscompanion && !c[0].issideboard).map(c => CardDisplay(c))}
            </div>
        </section>
        {cards.filter(c => c[0].issideboard).length > 0 && <section className="pt-8">
            <h2 className="mb-3 text-xl font-bold">Sideboard</h2>
            <div className={gridClass}>
                {cards.filter(c => c[0].issideboard).map(c => CardDisplay(c))}
            </div>
        </section>}
        {tokens.length > 0 && <section className="pt-8">
            <h2 className="mb-3 text-xl font-bold">Tokens</h2>
            <div className={gridClass}>
                {tokens.map(c => CardDisplay([{}, {id:c}]))}
            </div>
        </section>}

        <dialog id="card_style_selector" className="modal">
            {selectedCard && <div className="modal-box w-11/12 max-w-5xl max-h-3/4 pt-18">
                <form method="dialog">
                    <h2 className="absolute left-6 top-6 text-xl font-bold">{selectedCard[1].name ?? "Token"}</h2>
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" aria-label="Close">✕</button>
                </form>
                <div className={gridClass}>
                    {printings.filter(p => p.cardid == selectedCard[1].id).map(printing => {
                        return (
                            <div 
                                className="hover-3d cursor-pointer"
                                key={printing.cardimage}
                                onClick={() => {UpdatePrinting(selectedCard, printing.cardimage, printing.id); dialog('card_style_selector')?.close()}}
                            >
                                <figure className="max-w-100 rounded-2xl">
                                    <img src={printing.cardimage} alt={`${selectedCard[1].name ?? "Token"} printing`} />
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
            <div className="modal-box">
                <form method="dialog">
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" aria-label="Close">✕</button>
                </form>
                <h2 className="text-xl font-bold">{displayName} downloaded</h2>
                <ol className="mt-4 list-decimal space-y-3 pl-5">
                    <li>
                        Move the file to your Tabletop Simulator saved objects folder:
                        <code className="mt-1 block break-all text-sm">{`Documents\\My Games\\Tabletop Simulator\\Saves\\Saved Objects`}</code>
                    </li>
                    <li>Download the card back image too. TTS uses it as the icon in the in-game browser; keep it next to the deck file with the same name.</li>
                </ol>
                <div className="modal-action">
                    <button className="btn btn-primary" onClick={() => downloadImage(cardBack, displayName + ".png")}>Download card back image</button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    </main>);
}