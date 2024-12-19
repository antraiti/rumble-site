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
    async function stealDeck(token: string, id: number) {
        return fetch(`/api/deck/${id}/steal`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': token
        }})
        .then(data => {
            if(data.status >= 400) {
                console.log(data)
                throw new Error("Server responds with error!");
            }
            return data.json();
        })
    }   

export default function DeckDetails({ params }: { params: { deckid: number }}) {
    const { userToken } = userData();
    const router = useRouter();
    const [deckData, setDeckData] = useState<any | null>();
    const [commanders, setCommanders] = useState<any[]>([]);
    const [companions, setCompanions] = useState<any[]>([]);
    const [creatures, setCreatures] = useState<any[]>([]);
    const [planeswalkers, setPlaneswalkers] = useState<any[]>([]);
    const [sorceries, setSorceries] = useState<any[]>([]);
    const [instants, setInstants] = useState<any[]>([]);
    const [artifacts, setArtifacts] = useState<any[]>([]);
    const [enchantments, setEnchantments] = useState<any[]>([]);
    const [lands, setLands] = useState<any[]>([]);
    const [sideboard, setSideboard] = useState<any[]>([]);
    const [userlist, setUserlist] = useState<any | null>();

    const sendToClipboard = () => {
        var decktext = "";
        
        deckData.cardlist.map((card: any) => {
            if (!card[0].issideboard) {
                decktext += `${card[0].count} ${card[1].name}\n`
            }
        })

        if (sideboard.length > 0) {
            decktext += `\nSideboard:\n`
            sideboard.map((card: any) => {
                decktext += `${card[0].count} ${card[1].name}\n`
            })
        }

        copyToClipboard(decktext)
    }

    //https://stackoverflow.com/questions/51805395/navigator-clipboard-is-undefined
    async function copyToClipboard(textToCopy: string) {
        // Navigator clipboard api needs a secure context (https)
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(textToCopy);
        } else {
            // Use the 'out of viewport hidden text area' trick
            const textArea = document.createElement("textarea");
            textArea.value = textToCopy;
                
            // Move textarea out of the viewport so it's not visible
            textArea.style.position = "absolute";
            textArea.style.left = "-999999px";
                
            document.body.prepend(textArea);
            textArea.select();
    
            try {
                document.execCommand('copy');
            } catch (error) {
                console.error(error);
            } finally {
                textArea.remove();
            }
        }
    }

    useEffect(() => {
        getDeckInfo(userToken, params.deckid).then((item) => {
            setCommanders([]);
            setCompanions([]);
            setCreatures([]);
            setPlaneswalkers([]);
            setSorceries([]);
            setInstants([]);
            setArtifacts([]);
            setEnchantments([]);
            setLands([]);
            setSideboard([]);
            setDeckData(item);
            item.cardlist.map((card: any) => {
                if (card[0].issideboard) {
                    setSideboard(prev => [...prev, card])
                    return;
                }
                if (card[0].iscommander) {
                    setCommanders(prev => [...prev, card])
                    return;
                }
                if (card[0].iscompanion) {
                    setCompanions(prev => [...prev, card])
                    return;
                }
                if (card[1].typeline.toLowerCase().includes("creature")) {
                    setCreatures(prev => [...prev, card])
                    return;
                }
                if (card[1].typeline.toLowerCase().includes("planeswalker")) {
                    setPlaneswalkers(prev => [...prev, card])
                    return;
                }
                if (card[1].typeline.toLowerCase().includes("sorcery")) {
                    setSorceries(prev => [...prev, card])
                    return;
                }
                if (card[1].typeline.toLowerCase().includes("instant")) {
                    setInstants(prev => [...prev, card])
                    return;
                }
                if (card[1].typeline.toLowerCase().includes("artifact")) {
                    setArtifacts(prev => [...prev, card])
                    return;
                }
                if (card[1].typeline.toLowerCase().includes("enchantment")) {
                    setEnchantments(prev => [...prev, card])
                    return;
                }
                if (card[1].typeline.toLowerCase().includes("land")) {
                    setLands(prev => [...prev, card])
                    return;
                }
            })
        });
        getUsers(userToken).then(items => {
            setUserlist(items);
        });
      }, [])

    return(
    <div className="mx-auto m-5 p-5 max-w-7xl">
        <div className="flex justify-between">
            <h1 className="text-4xl italic font-bold">{deckData ? deckData?.deck.name : "loading"}</h1>
            <div className="flex gap-2">
            <div className="tooltip" data-tip="Copy Decklist to Clipboard">
                <button className="btn btn-primary" onClick={() => sendToClipboard()}>Clipboard</button>
            </div>
                {userToken && <div className="tooltip" data-tip="Creates a Copy of this Deck on Your Account">
                    <button className="btn btn-primary" onClick={() => stealDeck(userToken, params.deckid).then(_ => router.push("/decks"))}>Steal</button>
                </div>}
            </div>
        </div>
        <h2>{deckData && userlist && userlist.includes((user: any) => user.id == deckData.deck.userid)?.username}</h2>
        <div className="pt-5">
            <h1 className="text-xl font-bold">{"Mainboard:"}</h1>
            <div className="xl:columns-4 lg:columns-4 md:columns-3 sm:columns-1">
                <h2>{`Commander${commanders.length > 1 ? "s" : ""}:`}</h2>
                {deckData && commanders.map((card: any) => {
                    return CardDisplay(card);
                })}

                {(deckData && companions.length > 0) && <h2 className="pt-2">{"Companion:"}</h2>}
                {(deckData && companions.length > 0) && companions.map((card: any) => {
                    return CardDisplay(card);
                })}

                {(deckData && creatures.length > 0) && <h2 className="pt-2">{`Creatures (${creatures.length}):`}</h2>}
                {(deckData && creatures.length > 0) && creatures.map((card: any) => {
                    return CardDisplay(card);
                })}

                {(deckData && planeswalkers.length > 0) && <h2 className="pt-2">{`Planeswalkers (${planeswalkers.length}):`}</h2>}
                {(deckData && planeswalkers.length > 0) && planeswalkers.map((card: any) => {
                    return CardDisplay(card);
                })}

                {(deckData && sorceries.length > 0) && <h2 className="pt-2">{`Sorceries (${sorceries.length}):`}</h2>}
                {(deckData && sorceries.length > 0) && sorceries.map((card: any) => {
                    return CardDisplay(card);
                })}

                {(deckData && instants.length > 0) && <h2 className="pt-2">{`Instants (${instants.length}):`}</h2>}
                {(deckData && instants.length > 0) && instants.map((card: any) => {
                    return CardDisplay(card);
                })}

                {(deckData && artifacts.length > 0) && <h2 className="pt-2">{`Artifacts (${artifacts.length}):`}</h2>}
                {(deckData && artifacts.length > 0) && artifacts.map((card: any) => {
                    return CardDisplay(card);
                })}

                {(deckData && enchantments.length > 0) && <h2 className="pt-2">{`Enchantments (${enchantments.length}):`}</h2>}
                {(deckData && enchantments.length > 0) && enchantments.map((card: any) => {
                    return CardDisplay(card);
                })}

                {(deckData && lands.length > 0) && <h2 className="pt-2">{`Lands (${lands.length}):`}</h2>}
                {(deckData && lands.length > 0) && lands.map((card: any) => {
                    return CardDisplay(card);
                })}
                </div>
            <div className="divider"></div>
            <h2 className="text-xl font-bold pt-6">{"Sideboard:"}</h2>
            <div className="md:columns-3 sm:columns-1">
                {deckData && deckData?.cardlist.filter((card: any) => card[0].issideboard).map((card: any) => {
                    return CardDisplay(card);
                })}
            </div>
        </div>
    </div>);
}

function CardDisplay(card: any) {
    return (<div className={`flex bg-secondary h-6 w-64 rounded-md m-1 ${card[0].iscommander ? "border-yellow-500 border " : ""}`} key={card[1].name}>
                            <div className="px-2">{card[0].count}</div>
                            <a className="hover:font-bold" href={`https://scryfall.com/search?q=oracleid=${card[1].id}`}target="_blank">{card[1].name.split("//")[0]}</a>
                            {card[1].watchlist && <svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#fff700" stroke="#fff700"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>This Card is on the Watchlist</title> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Alert"> <rect id="Rectangle" fill-rule="nonzero" x="0" y="0" width="24" height="24"> </rect> <line x1="12" y1="13" x2="12" y2="9" id="Path" stroke="#fff700" stroke-width="2" stroke-linecap="round"> </line> <line x1="12" y1="16.5" x2="12" y2="16.63" id="Path" stroke="#fff700" stroke-width="2" stroke-linecap="round"> </line> <path d="M10.2679,5.0000025 C11.0377,3.66667 12.9622,3.66667 13.732,5.0000025 L20.6602,17.0000025 C21.43,18.3333 20.4678,20.0000025 18.9282,20.0000025 L5.07177,20.0000025 C3.53217,20.0000025 2.56992,18.3333 3.33972,17.0000025 L10.2679,5.0000025 Z" id="Path" stroke="#fff700" stroke-width="2" stroke-linecap="round"> </path> </g> </g> </g></svg>}
                            {card[1].banned && <svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#ff0000" stroke="#ff0000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>This Card Is BANNED</title> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Alert"> <rect id="Rectangle" fill-rule="nonzero" x="0" y="0" width="24" height="24"> </rect> <line x1="12" y1="13" x2="12" y2="9" id="Path" stroke="#ff0000" stroke-width="2" stroke-linecap="round"> </line> <line x1="12" y1="16.5" x2="12" y2="16.63" id="Path" stroke="#ff0000" stroke-width="2" stroke-linecap="round"> </line> <path d="M10.2679,5.0000025 C11.0377,3.66667 12.9622,3.66667 13.732,5.0000025 L20.6602,17.0000025 C21.43,18.3333 20.4678,20.0000025 18.9282,20.0000025 L5.07177,20.0000025 C3.53217,20.0000025 2.56992,18.3333 3.33972,17.0000025 L10.2679,5.0000025 Z" id="Path" stroke="#ff0000" stroke-width="2" stroke-linecap="round"> </path> </g> </g> </g><div className="tooltip" data-tip="hello"></div></svg>}
                        </div>);
}