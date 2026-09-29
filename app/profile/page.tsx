'use client'
import { useContext, useEffect, useState } from "react";
import userData from "../util/UserData"
import SetThemeContext from "../components/ThemeContext";
import Cookies from "js-cookie";
import { apiGet, apiPost, apiPut } from "../util/apiClient";
import type { BulkProcessReport, User } from "../types";

async function sendPassowrdChangeRequest(token: string, usernamne: string, password: string) {
    return apiPut(`user/${usernamne}/pass`, { token, body: password });
}

async function getUsers(token: string) {
    return apiGet<User[]>('users', { token });
}

async function createNewUser(token: string, username: string, pass: string) {
    return apiPost('user', { token, body: {"username": username, "password": pass} });
}

export default function Profile() {
    const storedTheme = Cookies.get('theme')
    const { userToken, userName, isAdmin } = userData();
    const [pword, setPword] = useState("");
    const [userlist, setUserlist] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState(userName);
    const [newUsername, setNewUsername] = useState("");
    const [newUserpassword, setNewUserpassword] = useState("");
    const [creatingUser, setCreatingUser] = useState(false);
    const [newUserMessage, setNewUserMessage] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [bulkAction, setBulkAction] = useState<"idle" | "preview" | "update">("idle");
    const [bulkReport, setBulkReport] = useState<BulkProcessReport | null>(null);
    const [bulkMessage, setBulkMessage] = useState("");
    const [bulkError, setBulkError] = useState("");
    const [selectedTheme, setSelectedTheme] = useState<string>((storedTheme ? storedTheme : "default") as string); //wtf
    const ThemeSetter = useContext(SetThemeContext);

    useEffect(() => {
        getUsers(userToken).then(items => {
            setUserlist(items);
        }).catch(() => {
            setUserlist([]);
        });
    }, [userToken])

    async function changePassword() {
        if (!userToken || !selectedUser || pword.length < 5) {
            setPasswordMessage("Password must be at least 5 characters.");
            return;
        }

        try {
            await sendPassowrdChangeRequest(userToken, selectedUser, pword);
            setPword("");
            setPasswordMessage("Password updated.");
        } catch {
            setPasswordMessage("Unable to update password.");
        }
    }

    async function createUser() {
        if (!userToken || newUsername.length === 0 || newUserpassword.length < 5) return;

        setCreatingUser(true);
        setNewUserMessage("");
        try {
            await createNewUser(userToken, newUsername, newUserpassword);
            setNewUsername("");
            setNewUserpassword("");
            setNewUserMessage("User created.");
        } catch {
            setNewUserMessage("Unable to create user.");
        } finally {
            setCreatingUser(false);
        }
    }

    async function previewLocalBulk() {
        if (!userToken) return;
        setBulkAction("preview");
        setBulkReport(null);
        setBulkMessage("");
        setBulkError("");
        try {
            const report = await apiPost<BulkProcessReport>("admin/bulkprocess/dry-run?sample_limit=20", { token: userToken });
            if (!report.dry_run || report.database_writes) {
                throw new Error("The API did not confirm this was a no-write preview.");
            }
            setBulkReport(report);
        } catch (error) {
            setBulkError(error instanceof Error ? error.message : "Local bulk preview failed.");
        } finally {
            setBulkAction("idle");
        }
    }

    async function updateBulkFromScryfall() {
        if (!userToken || !window.confirm("This downloads the current Scryfall all-cards file and writes updates to the database. Continue?")) return;
        setBulkAction("update");
        setBulkReport(null);
        setBulkMessage("");
        setBulkError("");
        try {
            const result = await apiPost<{ message: string; report: BulkProcessReport }>("admin/bulkupdate", { token: userToken });
            setBulkMessage(result.message || "Scryfall bulk update completed.");
            setBulkReport(result.report);
        } catch (error) {
            setBulkError(error instanceof Error ? error.message : "Scryfall bulk update failed.");
        } finally {
            setBulkAction("idle");
        }
    }

    function downloadBulkReport() {
        if (!bulkReport) return;
        const blob = new Blob([JSON.stringify(bulkReport, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = bulkReport.database_writes ? "bulk-update-report.json" : "bulk-dry-run-report.json";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    
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
                    {passwordMessage.length > 0 && <p role="status">{passwordMessage}</p>}
                    <button className="btn btn-warning" onClick={changePassword}>Change Password</button>
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
                <button disabled={!(newUsername.length > 0 && newUserpassword.length >= 5 && !creatingUser)} className="btn btn-warning" onClick={createUser}>Create New User</button>
            </div>
        </div>}
        {isAdmin && <section className="flex flex-col max-w-3xl bg-base-100 shadow-xl mx-auto rounded-3xl m-5 p-6 gap-4" aria-labelledby="bulk-admin-heading">
            <h2 id="bulk-admin-heading" className="text-lg font-semibold">Card bulk update</h2>
            <p>Preview processes the local bulk file without database writes. The Scryfall update downloads the current file and applies changes.</p>
            <div className="flex flex-wrap gap-3">
                <button className="btn btn-outline" disabled={bulkAction !== "idle"} onClick={previewLocalBulk}>
                    {bulkAction === "preview" ? "Previewing..." : "Preview local bulk"}
                </button>
                <button className="btn btn-warning" disabled={bulkAction !== "idle"} onClick={updateBulkFromScryfall}>
                    {bulkAction === "update" ? "Updating..." : "Fetch and apply Scryfall bulk"}
                </button>
            </div>
            {bulkError && <p role="alert" className="text-error">{bulkError}</p>}
            {bulkMessage && <p role="status">{bulkMessage}</p>}
            {bulkReport && <div role="status" className="space-y-2">
                <p>{bulkReport.database_writes ? "Bulk operation complete." : "Preview complete."} Database writes: {bulkReport.database_writes ? "yes" : "no"}. Source: {bulkReport.source}. Saved report: {bulkReport.report_file || "not available"}</p>
                <p>Scanned {bulkReport.cards_scanned} cards; {bulkReport.english_cards} English. {bulkReport.database_writes ? "Completed changes:" : "Proposed changes:"} {bulkReport.new_cards} cards, {bulkReport.updated_cards} card repairs, {bulkReport.new_card_backs} card backs, {bulkReport.new_printings} printings, {bulkReport.new_card_tokens} token links.</p>
                <p>Skipped: {bulkReport.skipped_non_english} non-English, {bulkReport.skipped_alchemy} Alchemy, {bulkReport.skipped_invalid} invalid. Textless cards: {bulkReport.textless_cards}. Unresolved token cards: {bulkReport.unresolved_token_cards}. Warnings: {bulkReport.warnings.length}{bulkReport.warnings_truncated ? "+" : ""}.</p>
                <button className="btn btn-outline btn-sm" onClick={downloadBulkReport}>Download verification report</button>
                {bulkReport.updated_card_ids.length > 0 && <details><summary>Updated card IDs ({bulkReport.updated_card_ids.length})</summary><ul className="max-h-48 overflow-auto font-mono text-sm">{bulkReport.updated_card_ids.map(id => <li key={id}>{id}</li>)}</ul></details>}
                {bulkReport.added_card_ids.length > 0 && <details><summary>Added card IDs ({bulkReport.added_card_ids.length})</summary><ul className="max-h-48 overflow-auto font-mono text-sm">{bulkReport.added_card_ids.map(id => <li key={id}>{id}</li>)}</ul></details>}
                {bulkReport.unresolved_token_details.length > 0 && <details><summary>Unresolved token links ({bulkReport.unresolved_token_details.length})</summary><ul className="max-h-48 overflow-auto font-mono text-sm">{bulkReport.unresolved_token_details.map(item => <li key={item.card_oracle_id}>{item.card_oracle_id}: missing {item.missing_token_ids.join(", ")}</li>)}</ul></details>}
                {bulkReport.warnings.length > 0 && <ul className="list-disc pl-5">{bulkReport.warnings.slice(0, 5).map((warning, index) => <li key={`${index}-${warning}`}>{warning}</li>)}</ul>}
            </div>}
        </section>}
    </div>
    );
}