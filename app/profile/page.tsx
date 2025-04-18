'use client'
import { useContext, useEffect, useState } from "react";
import userData from "../util/UserData"
import SetThemeContext from "../components/ThemeContext";
import Cookies from "js-cookie";

async function sendPassowrdChangeRequest(token: string, usernamne: string, password: string) {
    return fetch(`/api/user/${usernamne}/pass`, {
    method: 'PUT',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token
    },
    body: JSON.stringify(password)
    }).then(data => {
        if(data.status >= 400) {
            throw new Error("Server responds with error!");
        } else if (data.status === 204) {
            return [];
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

async function createNewUser(token: string, username: string, pass: string) {
    return fetch(`/api/user`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': token
        },
        body: JSON.stringify({"username": username, "password": pass})
        }).then(data => {
            if(data.status >= 400) {
                throw new Error("Server responds with error!");
            } else if (data.status === 204) {
                return [];
            }
            return data.json();
        })
}

export default function Profile() {
    const storedTheme = Cookies.get('theme')
    const { userToken, userName, isAdmin } = userData();
    const [pword, setPword] = useState("");
    const [userlist, setUserlist] = useState([]);
    const [selectedUser, setSelectedUser] = useState(userName);
    const [newUsername, setNewUsername] = useState("");
    const [newUserpassword, setNewUserpassword] = useState("");
    const [creatingUser, setCreatingUser] = useState(false);
    const [newUserMessage, setNewUserMessage] = useState("");
    const [selectedTheme, setSelectedTheme] = useState<string>((storedTheme ? storedTheme : "default") as string); //wtf
    const ThemeSetter = useContext(SetThemeContext);

    useEffect(() => {
        getUsers(userToken).then(items => {
            setUserlist(items);
        });
      }, [])
    
    return (
    <div>
        <div className="flex flex-col max-w-3xl bg-base-100 shadow-xl mx-auto rounded-3xl m-5">
            {isAdmin &&
                <select className="select select-bordered w-full max-w-xs" value={selectedUser} onChange={(e: any) => setSelectedUser(e.target.value)}>
                    {userlist.length > 0 && userlist.map((u: any) => <option key={u.username} value={u.username}>{u.username}</option>)}
                    <option>Greedo</option>
                </select>
            }
            <div className="flex">
                {/* <div className="flex flex-col m-5">
                    <img src="https://i.pinimg.com/736x/48/ac/9a/48ac9ab959f2ad420c4525e7c6258d2a.jpg" className="rounded-xl shadow-xl h-52"/>
                    <input disabled type="text" placeholder="Profile image url..." className="input input-bordered mt-2"/>
                </div> */}
                <div className="flex flex-col items-center w-full m-5 gap-5">
                    <input disabled type="text" placeholder="Username" className="input input-bordered mt-2" value={selectedUser}/>
                    <input type="password" placeholder="New Password" className="input input-bordered mt-2" onChange={(e: any) => setPword(e.target.value)}/>
                    <button className="btn btn-warning" onClick={() => sendPassowrdChangeRequest(userToken, selectedUser, pword)}>Change Password</button>
                </div>
            </div>
        </div>
        <div className="flex flex-col max-w-3xl bg-base-100 shadow-xl mx-auto rounded-3xl m-5 p-10">
                <fieldset className="fieldset">
                <legend className="fieldset-legend">Themes</legend>
                <select className="select select-bordered w-full max-w-xs" value={selectedTheme} onChange={(e: any) =>  {setSelectedTheme(e.target.value);ThemeSetter(e.target.value)}}>
                    <option>default</option>
                    <option>light</option>
                    <option>dark</option>
                    <option>cupcake</option>
                    <option>bumblebee</option>
                    <option>emerald</option>
                    <option>corporate</option>
                    <option>synthwave</option>
                    <option>retro</option>
                    <option>cyberpunk</option>
                    <option>valentine</option>
                    <option>halloween</option>
                    <option>garden</option>
                    <option>forest</option>
                    <option>aqua</option>
                    <option>lofi</option>
                    <option>pastel</option>
                    <option>fantasy</option>
                    <option>wireframe</option>
                    <option>black</option>
                    <option>luxury</option>
                    <option>dracula</option>
                    <option>cmyk</option>
                    <option>autumn</option>
                    <option>business</option>
                    <option>acid</option>
                    <option>lemonade</option>
                    <option>night</option>
                    <option>coffee</option>
                    <option>winter</option>
                    <option>dim</option>
                    <option>nord</option>
                    <option>sunset</option>
                    <option>caramellatte</option>
                    <option>abyss</option>
                    <option>silk</option>
                </select>
                </fieldset>
        </div>
        {isAdmin && <div className="flex flex-col max-w-3xl bg-base-100 shadow-xl mx-auto rounded-3xl m-5">
            <div className="flex flex-col items-center w-full m-5 gap-5">
                <>ADMIN: Create New User</>
                {newUserMessage.length > 0 && <h1>{newUserMessage}</h1>}
                <input type="text" placeholder="Username" className="input input-bordered mt-2" value={newUsername} onChange={(e: any) => setNewUsername(e.target.value)}/>
                <input type="password" placeholder="New Password" className="input input-bordered mt-2" onChange={(e: any) => setNewUserpassword(e.target.value)}/>
                <button disabled={!(newUsername.length > 0 && newUserpassword.length > 5 && !creatingUser)} className="btn btn-warning" onClick={() => { setCreatingUser(true);createNewUser(userToken, newUsername, newUserpassword).then(_ => {setCreatingUser(false); setNewUserMessage("User Created");}); setNewUserpassword("")}}>Create New User</button>
            </div>
        </div>}
    </div>
    );
}