'use client'

import { useEffect, useState } from "react";
import userData from "../util/UserData"
import { useRouter } from 'next/navigation'

async function loginUser(credentials: any) {
    return fetch('/api/login', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
    })
    .then(data => {
        if(data.status >= 400) {
            throw new Error("Server responds with error!");
        } else if (data.status != 200) {
            throw new Error("Invalid login");
        }
        return data.json();
    })
}

export default function SignIn() {
    const [loginerror, setLoginerror] = useState(false);
    const {setUserData, user} = userData();
    const router = useRouter();
    const [rememberUser, setRememberUser] = useState(false);

    useEffect(() => {
        if(user) router.push('/');
    }, []);


    const handleSubmit = async (e: any) => {
        e.preventDefault();
        console.log((document.getElementById("username") as any).value + " " + (document.getElementById("password") as any).value);
        const userData = await loginUser({
          "username": (document.getElementById("username") as any).value,
          "password": (document.getElementById("password") as any).value
        });
        console.log(userData);
        if(userData?.username != null) {
            setLoginerror(false);
            setUserData({...userData, rememberUser});
            window.location.reload(); //would rather have a responsive way to handle this but havent found a clean react way
        } else {
            setLoginerror(true);
        }
      }
    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content">
                <div className="card shadow-2xl bg-base-100">
                {loginerror && <div role="alert" className="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Error logging in</span>
                </div>}
                <form className="card-body" onSubmit={handleSubmit}>
                    <div className="form-control">
                    <label className="label">
                        <span className="label-text">Username</span>
                    </label>
                    <input id="username" type="text" placeholder="username" className="input input-bordered" required />
                    </div>
                    <div className="form-control">
                    <label className="label">
                        <span className="label-text">Password</span>
                    </label>
                    <input id="password" type="password" placeholder="password" className="input input-bordered" required />
                    <label className="label">
                        <a href="#" className="label-text-alt link link-hover">Internal use only</a>
                    </label>
                    </div>
                    <div className="form-control">
                        <label className="label cursor-pointer">
                            <span className="label-text">Remember me</span> 
                            <input type="checkbox" checked={rememberUser} className="checkbox" onChange={(e: any) => setRememberUser(e.target.checked)}/>
                        </label>
                    </div>
                    <div className="form-control mt-6">
                        <button type="submit" className="btn btn-primary">Login</button>
                    </div>
                </form>
                </div>
            </div>
            </div>
    );
}