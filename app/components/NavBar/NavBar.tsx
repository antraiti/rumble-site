'use client'
import Link from "next/link";
import userData from "../../util/UserData"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NavBar() {
    const { userName, removeUserData, user} = userData();
    const [username, setUsername] = useState();
    const router = useRouter();
    
    useEffect(() => {
        setUsername(userName);
    }, [user]);

    function handleSignout(){
        removeUserData();
        router.push("/login");
        window.location.reload();
    }

    return (
        <div className="navbar bg-base-100 text-base-content">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost md:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                    </div>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow-sm bg-base-100 rounded-box w-52">
                        <Link href="/rules" className="btn btn-ghost justify-start">Rules</Link>
                        <Link href="/banlist"  className="btn btn-ghost justify-start">Banlist</Link>
                        <div className="divider"/>
                        {!username &&
                        <Link href="login" className="btn btn-ghost">Sign In</Link>
                        }
                        {username &&
                        <div>
                        <Link href="/events" className="btn btn-ghost justify-start">Events</Link>
                        <Link href="/decks" className="btn btn-ghost justify-start">Decks</Link>
                        <Link href="/stats" className="btn btn-ghost justify-start">Stats</Link> 
                        <Link href="/profile" className="btn btn-ghost justify-start">{username}</Link>
                        <div onClick={handleSignout} className="btn btn-ghost">Sign Out</div>
                        </div>}
                    </ul>
                </div>
                <Link href="/"><img className="h-12" src="/QuickBanner.png"></img></Link>
                <Link href="/quickstart" className="btn btn-ghost hidden md:flex">Quickstart</Link>
                <Link href="/rules" className="btn btn-ghost hidden md:flex">Rules</Link>
                <Link href="/banlist"  className="btn btn-ghost hidden md:flex">Banlist</Link>
                <Link href="/decks/checker"  className="btn btn-ghost hidden md:flex">Deck Check</Link>
                <Link href="/starterdecks" className="btn btn-ghost hidden md:flex">Starter Decks</Link>
                {/* <Link href="/rules" className="btn btn-ghost">Deck Check</Link> */}
            </div>
            <div className="navbar-end hidden md:flex">
                {!username &&
                <Link href="login" className="btn">Sign In</Link>
                }
                {username &&
                <div>
                <Link href="/events" className="btn btn-ghost">Events</Link>
                <Link href="/decks" className="btn btn-ghost">Decks</Link>
                <Link href="/stats" className="btn btn-ghost">Stats</Link> 
                <Link href="/profile" className="btn btn-ghost">{username}</Link>
                <div onClick={handleSignout} className="btn btn-ghost">Sign Out</div>
                </div>}
            </div>
        </div>
    );
}
