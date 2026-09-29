'use client'

import { useEffect, useState } from "react";
import userData from "../util/UserData"
import { useRouter } from 'next/navigation'

async function loginUser(credentials: any) {
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    if (response.status >= 400) throw new Error("Server responds with error!");
    if (response.status !== 200) throw new Error("Invalid login");
    return response.json();
}

export default function SignIn() {
    const [loginerror, setLoginerror] = useState(false);
    const [loginPending, setLoginPending] = useState(false);
    const {setUserData, user} = userData();
    const router = useRouter();
    const [rememberUser, setRememberUser] = useState(false);

    useEffect(() => {
        if(user) router.push('/');
    }, []);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoginerror(false);
        setLoginPending(true);
        const formData = new FormData(e.currentTarget);
        const credentials = {
            username: String(formData.get("username") ?? ""),
            password: String(formData.get("password") ?? ""),
        };
        try {
            const authenticatedUser = await loginUser(credentials);
            if (!authenticatedUser?.username || !authenticatedUser?.token) {
                setLoginerror(true);
                return;
            }

            setLoginerror(false);
            setUserData({...authenticatedUser, rememberUser});
            window.location.reload();
        } catch {
            setLoginerror(true);
        } finally {
            setLoginPending(false);
        }
      }
    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content">
                <div className="card shadow-2xl bg-base-100">
                {loginerror && <div role="alert" className="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Sign in failed. Check your details and try again.</span>
                </div>}
                <form className="card-body" method="post" onSubmit={handleSubmit}>
                    <div className="form-control">
                    <label className="label">
                        <span className="label-text">Username</span>
                    </label>
                    <input id="username" name="username" type="text" placeholder="username" autoComplete="username" className="input input-bordered" required />
                    </div>
                    <div className="form-control">
                    <label className="label">
                        <span className="label-text">Password</span>
                    </label>
                    <input id="password" name="password" type="password" placeholder="password" autoComplete="current-password" className="input input-bordered" required />
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
                        <button type="submit" className="btn btn-primary" disabled={loginPending}>
                            {loginPending ? "Signing in..." : "Login"}
                        </button>
                    </div>
                </form>
                </div>
            </div>
            </div>
    );
}