'use client'
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import userData from "../../util/UserData"
import { apiGet, apiPost } from "../../util/apiClient";
import type { User } from "../../types";


async function getUsers(token: string) {
    return apiGet<User[]>('users', { token });
  }

  async function SubmitDeck(token: string, di: any) {
    return apiPost('deck', { token, body: di });
}

export default function NewDeck() {
    const [users, setUsers] = useState<User[]>([]);
    const router = useRouter();
    const { userToken, userId } = userData();
    const [deckList, setDeckList] = useState("");
    const [deckUser, setDeckUser] = useState<number>();
    const [deckName, setDeckName] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getUsers(userToken)
        .then(item => setUsers(item))
        .catch(() => setUsers([]));
      }, [])

    const finalizeDeck = () => {
        console.log("Finalizing deck")
        setIsLoading(true);
            const di = {
                user: Number(deckUser ?? userId),
                list: deckList,
                name: deckName
            }
            setSubmitted(true);
            SubmitDeck(userToken, di)
            .then(response => {
                setIsLoading(false);
                if(response.deckid != null) {
                    router.push("/decks");
                } else {
                    var erStatus = response.status ?? "no status found"
                    var erMessage = response.message ?? "no message found"
                    setErrorMessage("[" + erStatus + "]" + erMessage)
                }
            })
            .catch(e => {
                setIsLoading(false)
                setErrorMessage("[" + e + "]" + e)
            })
        }

    return (
        <div className="bg-base-200 h-full">
            <div className="flex flex-col justify-items-center max-w-3xl m-3 mx-auto">
                {!isLoading ? 
                    (!errorMessage ? 
                        <div className="card flex flex-col justify-center items-center shadow-xl bg-base-100 p-5 m-5">
                            <h1>New Deck</h1>
                            {!isLoading && <select className="select select-bordered w-full m-5 max-w-m" value={deckUser ?? userId ?? ""} onChange={(e: any) => setDeckUser(Number(e.target.value))}>
                                {users && users.map((usr: any) => 
                                        <option key={usr.id} value={usr.id}>{usr.username}</option>
                                        )}
                            </select>}
                            <input disabled={submitted} onChange={e => setDeckName(e.target.value)} type="text" placeholder="Deck Name" className="input input-bordered w-full m-5 max-w-m"/>
                            <textarea disabled={submitted} onChange={e => setDeckList(e.target.value)} className="textarea textarea-bordered w-full m-5 max-w-m h-96" placeholder="Decklist..."></textarea>
                            <button className="btn btn-success w-full" onClick={() => finalizeDeck()} disabled={submitted}>Submit</button>
                        </div>
                        :
                        <div className="card flex flex-col justify-center items-center shadow-xl p-5 m-5">
                            <h1>Error Uploading</h1>
                            <p>{errorMessage}</p>
                        </div>
                    )
                    :
                    <div className="card flex flex-col justify-center items-center shadow-xl bg-base-200 p-5 m-5">
                        <h1>Uploading Deck</h1>
                        <span className="loading loading-infinity loading-lg"></span>
                    </div>}
            </div>
        </div>);
}
