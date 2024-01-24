'use client'
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import userData from "../../util/UserData"


async function getUsers(token) {
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

  async function SubmitDeck(token, di) {
    console.log("submitting deck")
    return fetch('/api/deck', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token
    },
    body: JSON.stringify(di)
    })
    .then(data => {
        if(data.status >= 400) {
            throw new Error(data.message);
        } else {
            //success or different error handling
        }
        return data.json();
    })
}

export default function NewDeck() {
    const [users, setUsers] = useState([]);
    const router = useRouter();
    const { user, userToken } = userData();
    const [deckList, setDeckList] = useState("");
    const [deckUser, setDeckUser] = useState();
    const [deckName, setDeckName] = useState("");
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        getUsers(userToken)
        .then(item => {
            setUsers(item);
            setDeckUser(user?.publicid);
            })
      }, [])

    const finalizeDeck = () => {
        console.log("Finalizing deck")
            const di = {
                user: deckUser,
                list: deckList,
                name: deckName
            }
            setSubmitted(true);
            SubmitDeck(userToken, di)
            .then(response => {
                if(response.deckid != null) {
                    router.push("/decks");
                }
            })
        }

    return (
        <div className="bg-base-200 h-full">
            <div className="flex flex-col justify-items-center max-w-3xl m-3 mx-auto">
                <div className="card flex flex-col justify-center items-center shadow-xl bg-primary p-5 m-5">
                    <h1>New Deck</h1>
                    <select className="select select-bordered w-full m-5 max-w-m" value={deckUser}>
                        {users && users.map(usr => 
                                <option key={usr.publicid} value={usr.publicid}>{usr.username}</option>
                                )}
                    </select>
                    <input onChange={e => setDeckName(e.target.value)} type="text" placeholder="Deck Name" className="input input-bordered w-full m-5 max-w-m"/>
                    <textarea onChange={e => setDeckList(e.target.value)} className="textarea textarea-bordered w-full m-5 max-w-m h-96" placeholder="Decklist..."></textarea>
                    <button className="btn btn-success w-full" onClick={() => finalizeDeck()}>Submit</button>
                </div>
            </div>
        </div>);
}
