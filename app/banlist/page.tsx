'use client'
import { useState } from "react";

 //we will want to move this to server rendering ideally so that it catches in google searches or somethign

export default function Banlist() {
    const [bansearch, setBansearch] = useState("");

    return (
        <div className="flex flex-col">
            <div className="card mx-auto bg-primary shadow-xl m-5 p-5 w-3/4 max-w-4xl">
                <h1 className="mx-auto font-bold text-2xl mb-2">Banned Cards</h1>
                <p>
                    For Rumble we approach banning from a few different angles. Most notibly coming from other formats you will notice that many fast mana and high priced cards are banned.

                </p>
                <div className="divider"></div>
                {/* <a className="hover:font-bold" href="https://deckstats.net/decks/148092/2204198-bb-banlist" target="_blank" rel="noopener noreferrer" title="Link to banlist on deckstats">For Primary upkept banlist click here</a> */}
                <a className="hover:font-bold" href="https://scryfall.com/search?as=full&q=border%3Asilver" target="_blank" rel="noopener noreferrer" title="Link to Scryfall Results">All silver bordered cards from any of the “Un-” sets</a>
                <a className="hover:font-bold" href="https://scryfall.com/search?as=grid&order=name&q=type%3Aconspiracy" target="_blank" rel="noopener noreferrer" title="Link to Scryfall Results">All (25) cards with the Card Type “Conspiracy”</a>
                <a className="hover:font-bold" href="https://scryfall.com/search?as=grid&order=name&q=oracle%3A%22playing+for+ante%22" target="_blank" rel="noopener noreferrer" title="Link to Scryfall Results">All (9) cards that reference “playing for ante”</a>
            </div>
            <div className="flex justify-center m-2 mx-auto w-full">
                <input value={bansearch} type="text" placeholder="Search" className="input input-bordered max-w-md" onChange={(e: any) => setBansearch(e.target.value)}/>
            </div>
            <div className="flex max-w-6xl mx-auto">
                <div className="grid w-full lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1">
                    {[
                    "Ancestral Recall#https://cards.scryfall.io/normal/front/2/3/2398892d-28e9-4009-81ec-0d544af79d2b.jpg?1614638829", 
                    "Ancient Tomb#https://cards.scryfall.io/normal/front/b/d/bd3d4b4b-cf31-4f89-8140-9650edb03c7b.jpg?1582753000", 
                    "Badlands#https://cards.scryfall.io/normal/front/7/3/73403d04-fe97-4830-8b80-16dd1a1a6cc1.jpg?1562918068", 
                    "Balance#https://cards.scryfall.io/normal/front/c/e/ce648aa3-098b-4af0-a433-fd290bc85904.jpg?1580013606", 
                    "Bayou#https://cards.scryfall.io/normal/front/b/d/bd7567df-b4d8-41a8-8eac-c05afa784bfe.jpg?1562933075", 
                    "Black Lotus#https://cards.scryfall.io/normal/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg?1614638838", 
                    "Candelabra of Tawnos#https://cards.scryfall.io/normal/front/5/e/5e8416b8-aae1-4599-9e22-650dd86aefcb.jpg?1562917248", 
                    "Carpet of Flowers#https://cards.scryfall.io/normal/front/9/3/93abb48a-85f2-432d-8602-0a1d17fbb409.jpg?1562926232", 
                    "Channel#https://cards.scryfall.io/normal/front/c/e/ce54c7c1-3401-4414-8da0-5846cb0ae1b4.jpg?1618695674", 
                    "Chaos Orb#https://cards.scryfall.io/normal/front/7/a/7a601041-926f-40fd-8106-39099b87806f.jpg?1559592122", 
                    "Chrome Mox#https://cards.scryfall.io/normal/front/f/3/f340cbf7-5bbe-45b9-a4bf-d1caa500ff93.jpg?1599708839", 
                    "Cleanse#https://cards.scryfall.io/normal/front/a/f/af581e5a-abdb-4d76-8bda-32555aafc8ac.jpg?1591989158", 
                    "Crusade#https://cards.scryfall.io/normal/front/b/9/b99452c0-5d1c-4a73-90b6-0ec3ac0af893.jpg?1644608214", 
                    "Doomsday#https://cards.scryfall.io/normal/front/6/8/68c73755-9678-467a-abd5-f8dd1556864e.jpg?1562436538", 
                    "Drannith Magistrate#https://cards.scryfall.io/normal/front/9/8/98b0a4a8-9319-451b-9b79-b0bca7a41e91.jpg?1628801742", 
                    "Emrakul, the Aeons Torn#https://cards.scryfall.io/normal/front/2/4/249db4d4-2542-47ee-a216-e13ffbc2319c.jpg?1662523603", 
                    "Esper Sentinel#https://cards.scryfall.io/normal/front/f/3/f3537373-ef54-4578-9d05-6216420ee349.jpg?1626093502", 
                    "Falling Star#https://cards.scryfall.io/normal/front/f/2/f2b9983e-20d4-4d12-9e2c-ec6d9a345787.jpg?1562861838", 
                    "Fastbond#https://cards.scryfall.io/normal/front/d/a/daf43523-558c-4701-9fa3-5d1ceb82a006.jpg?1566819914", 
                    "Flash#https://cards.scryfall.io/normal/front/d/3/d31459c2-9656-4e9a-bb72-71a910e8570b.jpg?1587347037", 
                    "Gaea's Cradle#https://cards.scryfall.io/normal/front/2/5/25b0b816-0583-44aa-9dc5-f3ff48993a51.jpg?1562902898", 
                    "Hullbreacher#https://cards.scryfall.io/normal/front/4/d/4df8aabc-7fcb-4b7b-980b-18f499e6c170.jpg?1626088514", 
                    "Imprison#https://cards.scryfall.io/normal/front/1/2/12671381-beb7-41b8-9484-97f8aca5c981.jpg?1644608203", 
                    "Invoke Prejudice#https://cards.scryfall.io/normal/front/9/0/903d9fde-d7da-4a0e-a337-b63023c6d74b.jpg?1591988938", 
                    "Jeweled Lotus#https://cards.scryfall.io/normal/front/3/c/3c7de64b-3dc8-47dd-8999-4353b5a3a06f.jpg?1608911508", 
                    "Jihad#https://cards.scryfall.io/normal/front/b/6/b6c7705a-2987-4ef1-92b1-2c55d989ec6f.jpg?1644608192", 
                    "Karakas#https://cards.scryfall.io/normal/front/e/5/e52214e1-404a-405a-b08e-20e13c087338.jpg?1559959289", 
                    "Leovold, Emissary of Trest#https://cards.scryfall.io/normal/front/c/e/cedfc5b7-9242-4680-b284-debc8b5a9bc7.jpg?1559959275", 
                    "Library of Alexandria#https://cards.scryfall.io/normal/front/e/5/e5145f31-a4ac-44ef-8f85-e4d95f2c9ff5.jpg?1562940986", 
                    "Limited Resources#https://cards.scryfall.io/normal/front/2/0/20ae3609-a3cc-486c-94f6-b8f647adfb47.jpg?1562087362", 
                    "Lion's Eye Diamond#https://cards.scryfall.io/normal/front/7/5/758f95f8-bcb0-43ae-b474-56ebd855951e.jpg?1590511899", 
                    "Lutri, the Spellchaser#https://cards.scryfall.io/normal/front/f/b/fb1189c9-7842-466e-8238-1e02677d8494.jpg?1628801771", 
                    "Mana Crypt#https://cards.scryfall.io/normal/front/4/d/4d960186-4559-4af0-bd22-63baa15f8939.jpg?1599709515", 
                    "Mana Drain#https://cards.scryfall.io/normal/front/3/c/3c429c40-2389-41e5-8681-4bb274e25eba.jpg?1662525008", 
                    "Mana Vault#https://cards.scryfall.io/normal/front/c/1/c1a31d52-a407-4ded-bfca-cc812f11afa0.jpg?1666313366", 
                    "Mishra's Workshop#https://cards.scryfall.io/normal/front/a/a/aac0c8df-f01d-4178-8d66-ee603f814d24.jpg?1562929426", 
                    "Moat#https://cards.scryfall.io/normal/front/e/2/e2dffeb3-c858-4b8c-ae1f-109721f7d2da.jpg?1559592270", 
                    "Mox Diamond#https://cards.scryfall.io/normal/front/b/f/bf9fecfd-d122-422f-bd0a-5bf69b434dfe.jpg?1562431287", 
                    "Mox Emerald#https://cards.scryfall.io/normal/front/a/c/aced2c55-7543-4076-bcdd-36c4d649b8ae.jpg?1614638841", 
                    "Mox Jet#https://cards.scryfall.io/normal/front/5/f/5f6927e1-c580-483a-8e2a-6e2deb74800e.jpg?1614638844", 
                    "Mox Pearl#https://cards.scryfall.io/normal/front/e/d/ed0216a0-c5c9-4a99-b869-53e4d0256326.jpg?1614638847", 
                    "Mox Ruby#https://cards.scryfall.io/normal/front/4/5/45fd6e91-df76-497f-b642-33dc3d5f6a5a.jpg?1614638852", 
                    "Mox Sapphire#https://cards.scryfall.io/normal/front/e/a/ea1feac0-d3a7-45eb-9719-1cdaf51ea0b6.jpg?1614638862", 
                    "Mystic Remora#https://cards.scryfall.io/normal/front/1/3/13a08c07-e8b8-43bf-99e6-d268c79a62bf.jpg?1559592432", 
                    "Panoptic Mirror#https://cards.scryfall.io/normal/front/5/0/50e945b0-e919-41bb-9bc5-f71ad531e8f1.jpg?1562636846", 
                    "Paradox Engine#https://cards.scryfall.io/normal/front/f/d/fd8ccd81-9e11-47fa-8e16-064c52c24506.jpg?1576382376", 
                    "Plateau#https://cards.scryfall.io/normal/front/b/b/bb979a96-a57d-4fb5-8ebe-0bd398272abe.jpg?1562932720", 
                    "Pradesh Gypsies#https://cards.scryfall.io/normal/front/a/4/a4c9b18c-4993-4ce1-b2bd-ab14c9f3aad7.jpg?1644608181", 
                    "Prophet of Kruphix#https://cards.scryfall.io/normal/front/4/5/45de923f-fdab-460c-96f4-f62aefa9ad73.jpg?1562817436", 
                    "Rhystic Study#https://cards.scryfall.io/normal/front/d/6/d6914dba-0d27-4055-ac34-b3ebf5802221.jpg?1600698439", 
                    "Savannah#https://cards.scryfall.io/normal/front/b/0/b0d161fc-4a2a-4f1d-82b4-a746552552df.jpg?1562930574", 
                    "Scrubland#https://cards.scryfall.io/normal/front/9/d/9d471e36-a3ab-4a96-ba4b-8eca921ea37a.jpg?1562926691", 
                    "Serra's Sanctum#https://cards.scryfall.io/normal/front/f/7/f7a18130-dbaa-4657-a885-3a96a985935a.jpg?1653966911", 
                    "Shahrazad#https://cards.scryfall.io/normal/front/0/0/0014def3-4063-4929-ac51-76aef1bb2a68.jpg?1562895012", 
                    "Smothering Tithe#https://cards.scryfall.io/normal/front/f/2/f25a4bbe-2af0-4d4a-95d4-d52c5937c747.jpg?1662524375", 
                    "Sol Ring#https://cards.scryfall.io/normal/front/b/e/beebe533-29b9-4041-ab66-0a8233c50d56.jpg?1664362014", 
                    "Stone-Throwing Devils#https://cards.scryfall.io/normal/front/d/1/d1c387dd-1347-4443-91ce-b71f7ccdceba.jpg?1591989129", 
                    "Strip Mine#https://cards.scryfall.io/normal/front/f/5/f57fd4c9-0004-4f71-a30f-2720943f57ca.jpg?1562944463", 
                    "Sundering Titan#https://cards.scryfall.io/normal/front/a/2/a2ebb5d3-72b1-411d-8c90-83dac5b37898.jpg?1618940470", 
                    "Sway of the Stars#https://cards.scryfall.io/normal/front/5/e/5eb58d9e-d181-4167-8b80-64b238183bdb.jpg?1562877344", 
                    "Taiga#https://cards.scryfall.io/normal/front/0/c/0c2c39fc-b564-4ab5-833c-ff029760b7a7.jpg?1562897467", 
                    "The Tabernacle at Pendrell Vale#https://cards.scryfall.io/normal/front/c/d/cd3f7f4e-cb25-4121-96a0-a4dc530420b9.jpg?1562938371", 
                    "Time Vault#https://cards.scryfall.io/normal/front/c/3/c367ffc1-8084-45a1-87d5-22183604d1cb.jpg?1562934224", 
                    "Time Walk#https://cards.scryfall.io/normal/front/7/0/70901356-3266-4bd9-aacc-f06c27271de5.jpg?1614638832", 
                    "Tinker#https://cards.scryfall.io/normal/front/7/d/7da23b15-dfb8-4267-9b33-d7a4c035c434.jpg?1562863289", 
                    "Tolarian Academy#https://cards.scryfall.io/normal/front/f/d/fd99bce1-ce39-464b-8e61-2631eb3ed6f6.jpg?1610147079", 
                    "Trade Secrets#https://cards.scryfall.io/normal/front/5/8/58dadc78-fe87-40ac-94cb-128716d89d74.jpg?1592713134", 
                    "Tropical Island#https://cards.scryfall.io/normal/front/4/7/47033ba4-8f26-4a6b-97bd-5b366327325e.jpg?1632873386", 
                    "Tundra#https://cards.scryfall.io/normal/front/e/f/efd35cb4-862d-4699-a197-b744989b3ceb.jpg?1562943174", 
                    "Underground Sea#https://cards.scryfall.io/normal/front/2/6/26cee543-6eab-494e-a803-33a5d48d7d74.jpg?1562902883", 
                    "Upheaval#https://cards.scryfall.io/normal/front/b/e/befe74b1-c487-42bb-a1a1-4d13f3a86ff7.jpg?1626100271", 
                    "Volcanic Island#https://cards.scryfall.io/normal/front/2/f/2f607e7e-30c0-45e9-8f61-bf6e9fe63f2b.jpg?1562904669", 
                    "Worldfire#https://cards.scryfall.io/normal/front/2/e/2ef3d4b5-0453-4bf0-b018-23b0c3b9ae11.jpg?1631531850", 
                ].filter((c: string) => c.split("#")[0].toLocaleLowerCase().includes(bansearch.toLocaleLowerCase() ?? "")).map((cardinfo) => (
                    <div className="bg-secondary h-6 w-64 rounded-md m-1" key={cardinfo}>
                            <a href={cardinfo.split("#")[1]} className="p-2 hover:font-bold">{cardinfo.split("#")[0]}</a>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
}
