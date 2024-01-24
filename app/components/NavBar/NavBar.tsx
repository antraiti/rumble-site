'use client'
import Link from "next/link";
import userData from "../../util/UserData"
import { useEffect, useState } from "react";

export default function NavBar() {
    const { userName, removeUserData, user} = userData();
    const [username, setUsername] = useState();
    useEffect(() => {
        setUsername(userName);
    }, [user]);

    function handleSignout(){
        removeUserData();
        window.location.reload();
    }

    return (
        <div className="navbar bg-base-100 text-base-content">
            <div className="navbar-start">
                <Link href="/" className="btn btn-ghost text-xl">Rumble MTG</Link>
                <Link href="/rules" className="btn btn-ghost">Rules</Link>
                <Link href="/banlist"  className="btn btn-ghost">Banlist</Link>
                {/* <Link href="/rules" className="btn btn-ghost">Deck Check</Link> */}
            </div>
            <div className="navbar-end">
                {!username &&
                <Link href="login" className="btn">Sign In</Link>
                }
                {username &&
                <div>
                <Link href="/events" className="btn btn-ghost">Events</Link>
                <Link href="/decks" className="btn btn-ghost">Decks</Link>
                {/* <Link href="/login" className="btn btn-ghost">Stats</Link> */}
                <Link href="/login" className="btn btn-ghost">{username}</Link>
                <div onClick={handleSignout} className="btn btn-ghost">Sign Out</div>
                </div>}
            </div>
        </div>
    );
}
