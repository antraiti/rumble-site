'use client'
import { use, useEffect, useState } from "react";
import userData from "../../util/UserData"
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "../../util/apiClient";
import { CardPreviewRow, CategoryHeading, ManaSymbols, StatusIcon } from "../../components/CardList";

async function getDeckInfo(token: string, id: number) {
    return apiGet(`deck/${id}`, { token });
}

  async function getUsers(token: string) {
    return apiGet('users', { token });
  }
    async function stealDeck(token: string, id: number) {
        return apiPost(`deck/${id}/steal`, { token });
    }   

export interface DeckPageProps {
    deckid: number;
}

export default function DeckDetails({ params }: { params: Promise<DeckPageProps>}) {
    const {deckid} = use(params);
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
    const [printings, setPrintings] = useState<any[]>([]);
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
        getDeckInfo(userToken, deckid).then((item) => {
            console.dir(item)
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
            setPrintings(item.printings)
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
        // The user list needs a login; signed-out visitors can still view the deck.
        if (userToken) getUsers(userToken).then(items => {
            setUserlist(items);
        }).catch(() => {});
      }, [])

    
    function CardDisplay(card: any) {
        const [decklistEntry, cardInfo] = card;
        const cardImage = printings.find((printing: any) => printing.cardid == cardInfo.id)?.cardimage;
        const roleClass = decklistEntry.iscommander
            ? "border-l-warning bg-warning/5"
            : decklistEntry.iscompanion
                ? "border-l-info bg-info/5"
                : "border-l-transparent";

        return (
            <CardPreviewRow key={cardInfo.id} image={cardImage} name={cardInfo.name}>
                <article className={`flex min-h-9 w-full items-center gap-1.5 overflow-hidden rounded-md border border-base-300 border-l-2 bg-base-100 px-1 py-1 transition-colors hover:border-primary/50 hover:bg-base-200 ${roleClass}`}>
                    <span aria-label={`${decklistEntry.count} copies`} title={`${decklistEntry.count} in deck`} className="flex w-8 shrink-0 self-stretch items-center justify-center border-r border-base-content/10 font-mono text-base font-bold text-base-content/75">
                        {decklistEntry.count}
                    </span>
                    <a
                        className="min-w-0 flex-1 truncate text-sm font-medium leading-snug hover:text-primary hover:underline"
                        href={`https://scryfall.com/search?q=oracleid=${cardInfo.id}`}
                        target="_blank"
                        rel="noreferrer"
                        title={cardInfo.name}
                    >
                        {cardInfo.name.split("//")[0].trim()}
                    </a>
                    <div className="flex shrink-0 items-center gap-1">
                        {decklistEntry.iscommander && <StatusIcon src="/crown-svgrepo-com.svg" label="Commander" color="bg-warning" />}
                        {decklistEntry.iscompanion && <StatusIcon src="/person-team.svg" label="Companion" color="bg-info" />}
                        {cardInfo.watchlist && <StatusIcon src="/star-svgrepo-com.svg" label="On watchlist" color="bg-warning" />}
                        {cardInfo.banned && <StatusIcon src="/alert-svgrepo.svg" label="Banned card" color="bg-error" />}
                    </div>
                    <ManaSymbols cost={cardInfo.cost} />
                </article>
            </CardPreviewRow>);
    }

    const trueCount = (cardList: Array<any>) => {
        return cardList.reduce((accumulator, currentValue) => {return accumulator + currentValue[0].count}, 0)
    }

    return(
    <div className="mx-auto m-5 p-5 max-w-7xl">
        <div className="flex justify-between">
            <h1 className="text-4xl italic font-bold">{deckData ? deckData?.deck.name : "loading"}</h1>
            <div className="flex gap-2">
            <div className="tooltip" data-tip="Copy Decklist to Clipboard">
                <button className="btn btn-primary" onClick={() => sendToClipboard()}>Clipboard</button>
            </div>
                {userToken && <div className="tooltip" data-tip="Creates a Copy of this Deck on Your Account">
                    <button className="btn btn-primary" onClick={() => stealDeck(userToken, deckid).then(_ => router.push("/decks"))}>Steal</button>
                </div>}
            </div>
        </div>
        <h2>{deckData && userlist && userlist.includes((user: any) => user.id == deckData.deck.userid)?.username}</h2>
        <div className="pt-5">
            <h1 className="mb-2 text-xl font-bold">Mainboard</h1>
            <div className="columns-1 gap-3 md:columns-2 xl:columns-3">
                <CategoryHeading label={`Commander${commanders.length > 1 ? "s" : ""}`} count={trueCount(commanders)} />
                {deckData && commanders.map((card: any) => {
                    return CardDisplay(card);
                })}

                {(deckData && companions.length > 0) && <CategoryHeading label="Companion" count={trueCount(companions)} />}
                {(deckData && companions.length > 0) && companions.map((card: any) => {
                    return CardDisplay(card);
                })}

                {(deckData && creatures.length > 0) && <CategoryHeading label="Creatures" count={trueCount(creatures)} />}
                {(deckData && creatures.length > 0) && creatures.map((card: any) => {
                    return CardDisplay(card);
                })}

                {(deckData && planeswalkers.length > 0) && <CategoryHeading label="Planeswalkers" count={trueCount(planeswalkers)} />}
                {(deckData && planeswalkers.length > 0) && planeswalkers.map((card: any) => {
                    return CardDisplay(card);
                })}

                {(deckData && sorceries.length > 0) && <CategoryHeading label="Sorceries" count={trueCount(sorceries)} />}
                {(deckData && sorceries.length > 0) && sorceries.map((card: any) => {
                    return CardDisplay(card);
                })}

                {(deckData && instants.length > 0) && <CategoryHeading label="Instants" count={trueCount(instants)} />}
                {(deckData && instants.length > 0) && instants.map((card: any) => {
                    return CardDisplay(card);
                })}

                {(deckData && artifacts.length > 0) && <CategoryHeading label="Artifacts" count={trueCount(artifacts)} />}
                {(deckData && artifacts.length > 0) && artifacts.map((card: any) => {
                    return CardDisplay(card);
                })}

                {(deckData && enchantments.length > 0) && <CategoryHeading label="Enchantments" count={trueCount(enchantments)} />}
                {(deckData && enchantments.length > 0) && enchantments.map((card: any) => {
                    return CardDisplay(card);
                })}

                {(deckData && lands.length > 0) && <CategoryHeading label="Lands" count={trueCount(lands)} />}
                {(deckData && lands.length > 0) && lands.map((card: any) => {
                    return CardDisplay(card);
                })}
                </div>
            {sideboard.length > 0 && <>
                <div className="divider"></div>
                <div className="columns-1 gap-3 md:columns-2 xl:columns-3">
                    <CategoryHeading label="Sideboard" count={trueCount(sideboard)} />
                    {sideboard.map((card: any) => {
                    return CardDisplay(card);
                    })}
                </div>
            </>}
        </div>
    </div>);
}

// function CardDisplay(card: any) {
//     return (<div className={`flex bg-base-100 h-6 w-64 tooltip rounded-md m-1 ${card[0].iscommander ? "border-yellow-500 border " : ""}`} key={card[1].name}>
//         <div className="tooltip-content">
//             <img src={printings.}></img>
//         </div>
//                             <div className="px-2">{card[0].count}</div>
//                             <a className="hover:font-bold" href={`https://scryfall.com/search?q=oracleid=${card[1].id}`}target="_blank">{card[1].name.split("//")[0]}</a>
//                             {card[1].watchlist && <svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#fff700" stroke="#fff700"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>This Card is on the Watchlist</title> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Alert"> <rect id="Rectangle" fill-rule="nonzero" x="0" y="0" width="24" height="24"> </rect> <line x1="12" y1="13" x2="12" y2="9" id="Path" stroke="#fff700" stroke-width="2" stroke-linecap="round"> </line> <line x1="12" y1="16.5" x2="12" y2="16.63" id="Path" stroke="#fff700" stroke-width="2" stroke-linecap="round"> </line> <path d="M10.2679,5.0000025 C11.0377,3.66667 12.9622,3.66667 13.732,5.0000025 L20.6602,17.0000025 C21.43,18.3333 20.4678,20.0000025 18.9282,20.0000025 L5.07177,20.0000025 C3.53217,20.0000025 2.56992,18.3333 3.33972,17.0000025 L10.2679,5.0000025 Z" id="Path" stroke="#fff700" stroke-width="2" stroke-linecap="round"> </path> </g> </g> </g></svg>}
//                             {card[1].banned && <svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#ff0000" stroke="#ff0000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>This Card Is BANNED</title> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Alert"> <rect id="Rectangle" fill-rule="nonzero" x="0" y="0" width="24" height="24"> </rect> <line x1="12" y1="13" x2="12" y2="9" id="Path" stroke="#ff0000" stroke-width="2" stroke-linecap="round"> </line> <line x1="12" y1="16.5" x2="12" y2="16.63" id="Path" stroke="#ff0000" stroke-width="2" stroke-linecap="round"> </line> <path d="M10.2679,5.0000025 C11.0377,3.66667 12.9622,3.66667 13.732,5.0000025 L20.6602,17.0000025 C21.43,18.3333 20.4678,20.0000025 18.9282,20.0000025 L5.07177,20.0000025 C3.53217,20.0000025 2.56992,18.3333 3.33972,17.0000025 L10.2679,5.0000025 Z" id="Path" stroke="#ff0000" stroke-width="2" stroke-linecap="round"> </path> </g> </g> </g><div className="tooltip" data-tip="hello"></div></svg>}
//                         </div>);
// }