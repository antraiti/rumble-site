import { useRouter } from "next/navigation";

export default function DeckCard(deckObject: any) {
    const deckInfo = deckObject.deckInfo;
    const colorInfo = deckObject.colorInfo;
    const deckCommander = deckObject.commanderInfo;
    const deckPartner = deckObject.partnerInfo;
    const deckCompanion = deckObject.companionInfo;
    const performanceInfo = deckObject.performanceInfo;
    const deleteFunction = deckObject.deleteFunction;
    const router = useRouter();
    
    function getCommanderImageUrl() {
        if (!deckCommander) {
        return 'https://cards.scryfall.io/art_crop/front/0/e/0eb0e8e7-266f-441e-b1cd-12b8ec3f7d71.jpg'; // Imp's Mischief UwU
        }
    
        const commanderId = deckCommander.id;
        let url = 'https://cards.scryfall.io/art_crop/front';
        url += '/' + commanderId.substring(0, 1);
        url += '/' + commanderId.substring(1, 2) + '/';
        url += commanderId + '.jpg';
    
        return url;      
    }

    function GotoDeckDetails() {
        router.push(`/deckdetails/${deckInfo.id}`);
    }

    return (
        <div onClick={() => GotoDeckDetails()} className="card cursor-pointer card-side bg-base-100 shadow-xl m-3 h-40 max-w-7xl mx-auto hover:shadow-accent">
            <figure className="w-1/4"><img src={getCommanderImageUrl()} alt={deckCommander?.name}/></figure>
            <div className="flex flex-col w-5 bg-gray-300">
                {colorInfo.red && <div className="flex flex-1 bg-red-300"><img className="flex-1" src="R.svg"/></div>}
                {colorInfo.blue && <div className="flex flex-1 bg-sky-200"><img className="flex-1" src="U.svg"/></div>}
                {colorInfo.white && <div className="flex flex-1 bg-amber-100"><img className="flex-1" src="W.svg"/></div>}
                {colorInfo.green && <div className="flex flex-1 bg-green-300"><img className="flex-1" src="G.svg"/></div>}
                {colorInfo.black && <div className="flex flex-1 bg-gray-300"><img className="flex-1" src="B.svg"/></div>}
                {colorInfo.name == "colorless" && <img className="flex-1" src="C.svg"/>}
            </div>
            <div className="flex-1 flex-col">
            <article className="prose text-center max-w-none"><h1 className="text-2xl text-center">{deckInfo?.name}</h1></article>
                <article className="prose text-center max-w-none"><p className="text-xl text-center">{deckCommander?.name}{deckPartner?.name && (" // " + deckPartner?.name)}</p></article>
                <div className="stats flex mt-auto">
                    <div className="stat">
                        <div className="stat-title">Games Played</div>
                        <div className="stat-value">{performanceInfo.length}</div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">Winrate</div>
                        <div className="stat-value">{
                            performanceInfo.length > 0 ?
                        ((performanceInfo.filter((p: any) => p.placement == 1)).length/(performanceInfo.length)*100).toFixed(2)+"%" :
                        ""
                        }</div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">Avg. Placement</div>
                        <div className="stat-value">{
                            performanceInfo.length > 0 ?
                        (performanceInfo.reduce((total: number, next: any) => total + next.placement, 0) / performanceInfo.length).toFixed(2) :
                        ""
                        }</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
