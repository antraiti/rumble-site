'use client'
import { useContext, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import userData from "../util/UserData"
import SetThemeContext from "../components/ThemeContext";
import PageHeader from "../components/PageHeader";
import Cookies from "js-cookie";
import { apiGet, apiPost, apiPut } from "../util/apiClient";
import type { BulkProcessReport, User } from "../types";

type BulkJobStatus = { running: boolean; stage?: string; started_at?: string; finished_at?: string; error?: string; report?: BulkProcessReport };
type Status = { kind: "success" | "error"; text: string } | null;

const MIN_PASSWORD = 5;
const MAX_USERNAME = 32;
const THEMES = ["default", "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter", "dim", "nord", "sunset", "caramellatte", "abyss", "silk"];

const errorText = (error: unknown, fallback: string) => (error instanceof Error && error.message ? error.message : fallback);

async function sendPasswordChangeRequest(token: string, username: string, password: string) {
    return apiPut(`user/${encodeURIComponent(username)}/pass`, { token, body: password });
}

async function getUsers(token: string) {
    return apiGet<User[]>('users', { token });
}

async function createNewUser(token: string, username: string, pass: string) {
    return apiPost('user', { token, body: { username, password: pass } });
}

export default function Profile() {
    const storedTheme = Cookies.get('theme')
    const { userToken, userName, isAdmin } = userData();
    const [userlist, setUserlist] = useState<User[]>([]);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordStatus, setPasswordStatus] = useState<Status>(null);
    const [savingPassword, setSavingPassword] = useState(false);

    const [resetUser, setResetUser] = useState("");
    const [resetPassword, setResetPassword] = useState("");
    const [resetStatus, setResetStatus] = useState<Status>(null);
    const [resetting, setResetting] = useState(false);

    const [newUsername, setNewUsername] = useState("");
    const [newUserpassword, setNewUserpassword] = useState("");
    const [createStatus, setCreateStatus] = useState<Status>(null);
    const [creatingUser, setCreatingUser] = useState(false);

    const [bulkAction, setBulkAction] = useState<"idle" | "preview" | "update">("idle");
    const [bulkReport, setBulkReport] = useState<BulkProcessReport | null>(null);
    const [bulkMessage, setBulkMessage] = useState("");
    const [bulkError, setBulkError] = useState("");
    const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [selectedTheme, setSelectedTheme] = useState<string>(storedTheme || "default");
    const ThemeSetter = useContext(SetThemeContext);

    function loadUsers() {
        if (!isAdmin || !userToken) return;
        getUsers(userToken).then(items => setUserlist(items ?? [])).catch(() => setUserlist([]));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(loadUsers, [isAdmin, userToken]);

    // Resume showing progress if an update is already running (e.g. after navigating away).
    useEffect(() => {
        if (!isAdmin || !userToken) return;
        let active = true;
        apiGet<BulkJobStatus>("admin/bulkupdate/status", { token: userToken })
            .then(status => {
                if (!active || !status.running) return;
                setBulkAction("update");
                setBulkMessage(`Bulk update running: ${status.stage ?? "working"}…`);
                pollTimer.current = setTimeout(pollBulkStatus, 5000);
            })
            .catch(() => {});
        return () => {
            active = false;
            if (pollTimer.current) clearTimeout(pollTimer.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin, userToken]);

    async function changeOwnPassword(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!userToken || !userName) return;
        if (newPassword.length < MIN_PASSWORD) return setPasswordStatus({ kind: "error", text: `Password must be at least ${MIN_PASSWORD} characters.` });
        if (newPassword !== confirmPassword) return setPasswordStatus({ kind: "error", text: "Passwords don't match." });
        setSavingPassword(true);
        setPasswordStatus(null);
        try {
            await sendPasswordChangeRequest(userToken, userName, newPassword);
            setNewPassword("");
            setConfirmPassword("");
            setPasswordStatus({ kind: "success", text: "Password updated. Use it next time you sign in." });
        } catch (error) {
            setPasswordStatus({ kind: "error", text: errorText(error, "Unable to update password.") });
        } finally {
            setSavingPassword(false);
        }
    }

    async function resetPlayerPassword(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!userToken || !resetUser) return;
        if (resetPassword.length < MIN_PASSWORD) return setResetStatus({ kind: "error", text: `Password must be at least ${MIN_PASSWORD} characters.` });
        setResetting(true);
        setResetStatus(null);
        try {
            await sendPasswordChangeRequest(userToken, resetUser, resetPassword);
            setResetPassword("");
            setResetStatus({ kind: "success", text: `Password reset for ${resetUser}.` });
        } catch (error) {
            setResetStatus({ kind: "error", text: errorText(error, "Unable to reset password.") });
        } finally {
            setResetting(false);
        }
    }

    async function createUser(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const username = newUsername.trim();
        if (!userToken || !username) return;
        if (username.length > MAX_USERNAME) return setCreateStatus({ kind: "error", text: `Usernames can be at most ${MAX_USERNAME} characters.` });
        if (newUserpassword.length < MIN_PASSWORD) return setCreateStatus({ kind: "error", text: `Password must be at least ${MIN_PASSWORD} characters.` });
        setCreatingUser(true);
        setCreateStatus(null);
        try {
            await createNewUser(userToken, username, newUserpassword);
            setNewUsername("");
            setNewUserpassword("");
            setCreateStatus({ kind: "success", text: `Created ${username}. They can sign in now.` });
            loadUsers();
        } catch (error) {
            setCreateStatus({ kind: "error", text: errorText(error, "Unable to create user.") });
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
            setBulkError(errorText(error, "Local bulk preview failed."));
        } finally {
            setBulkAction("idle");
        }
    }

    async function startBulkUpdate(local: boolean) {
        const warning = local
            ? "This applies the already-downloaded local bulk file to the database. It runs in the background and can take a while. Continue?"
            : "This downloads the current Scryfall all-cards file and writes updates to the database. It runs in the background and can take a while. Continue?";
        if (!userToken || !window.confirm(warning)) return;
        setBulkAction("update");
        setBulkReport(null);
        setBulkMessage("");
        setBulkError("");
        try {
            applyBulkStatus(await apiPost<BulkJobStatus>(local ? "admin/bulkupdate?source=local" : "admin/bulkupdate", { token: userToken }));
        } catch (error) {
            setBulkError(errorText(error, "Bulk update failed."));
            setBulkAction("idle");
        }
    }

    function applyBulkStatus(status: BulkJobStatus) {
        if (status.running) {
            setBulkAction("update");
            setBulkMessage(`Bulk update running: ${status.stage ?? "working"}…`);
            pollTimer.current = setTimeout(pollBulkStatus, 5000);
            return;
        }
        setBulkAction("idle");
        if (status.report) setBulkReport(status.report);
        if (status.error) {
            setBulkMessage("");
            setBulkError(status.error);
        } else {
            setBulkMessage("Bulk update completed.");
        }
    }

    async function pollBulkStatus() {
        try {
            applyBulkStatus(await apiGet<BulkJobStatus>("admin/bulkupdate/status", { token: userToken }));
        } catch (error) {
            setBulkAction("idle");
            setBulkError(errorText(error, "Couldn't check the bulk update status."));
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

    if (!userToken) {
        return (
            <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">
                <PageHeader eyebrow="Rumble / Profile" title="Profile">Sign in to manage your account.</PageHeader>
            </main>
        );
    }

    const otherPlayers = userlist.filter(user => user.username && user.username !== userName).sort((a, b) => a.username.localeCompare(b.username));

    return (
        <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">
            <PageHeader eyebrow="Rumble / Profile" title={<span className="flex flex-wrap items-center gap-3">{userName}{isAdmin && <span className="badge badge-warning">Admin</span>}</span>}>
                Manage your password and how the site looks.
            </PageHeader>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <Card title="Change password" description="You'll use the new password the next time you sign in.">
                    <form className="space-y-3" onSubmit={changeOwnPassword}>
                        <input type="text" name="username" autoComplete="username" value={userName ?? ""} readOnly hidden />
                        <label className="floating-label">
                            <span>New password</span>
                            <input type="password" className="input w-full" placeholder="New password" autoComplete="new-password" minLength={MIN_PASSWORD} value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                        </label>
                        <label className="floating-label">
                            <span>Confirm new password</span>
                            <input type="password" className="input w-full" placeholder="Confirm new password" autoComplete="new-password" minLength={MIN_PASSWORD} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                        </label>
                        <p className="text-sm text-base-content/60">At least {MIN_PASSWORD} characters.</p>
                        <StatusMessage status={passwordStatus} />
                        <button type="submit" className="btn btn-primary" disabled={savingPassword}>{savingPassword ? "Saving…" : "Update password"}</button>
                    </form>
                </Card>

                <Card title="Theme" description="Saved on this device.">
                    <label className="select w-full">
                        <span className="label">Theme</span>
                        <select value={selectedTheme} onChange={e => { setSelectedTheme(e.target.value); ThemeSetter(e.target.value); }}>
                            {THEMES.map(theme => <option key={theme} value={theme}>{theme}</option>)}
                        </select>
                    </label>
                    <div data-theme={selectedTheme} className="flex items-center gap-2 rounded-box border border-base-content/10 bg-base-100 p-3" aria-hidden="true">
                        {["bg-primary", "bg-secondary", "bg-accent", "bg-neutral", "bg-base-300"].map(swatch => <span key={swatch} className={`size-8 rounded-field ${swatch}`} />)}
                        <span className="ml-2 text-sm text-base-content/70">Preview</span>
                    </div>
                </Card>
            </div>

            {isAdmin && (
                <section aria-labelledby="admin-heading" className="mt-10 rounded-box border border-warning/40 bg-warning/5 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="badge badge-warning">Admin</span>
                        <h2 id="admin-heading" className="text-2xl font-bold">Admin tools</h2>
                    </div>
                    <p className="mt-1 text-base-content/70">Only admins can see this. These actions change other players&apos; accounts and the shared card database.</p>

                    <div className="mt-6 grid gap-6 lg:grid-cols-2">
                        <Card title="Create a player" description="Add a new account. Share the password with them so they can sign in and change it.">
                            <form className="space-y-3" onSubmit={createUser}>
                                <label className="floating-label">
                                    <span>Username</span>
                                    <input type="text" className="input w-full" placeholder="Username" autoComplete="off" maxLength={MAX_USERNAME} value={newUsername} onChange={e => setNewUsername(e.target.value)} required />
                                </label>
                                <label className="floating-label">
                                    <span>Password</span>
                                    <input type="password" className="input w-full" placeholder="Password" autoComplete="new-password" minLength={MIN_PASSWORD} value={newUserpassword} onChange={e => setNewUserpassword(e.target.value)} required />
                                </label>
                                <StatusMessage status={createStatus} />
                                <button type="submit" className="btn btn-warning" disabled={creatingUser}>{creatingUser ? "Creating…" : "Create player"}</button>
                            </form>
                        </Card>

                        <Card title="Reset a player's password" description="Set a new password for someone who's locked out.">
                            <form className="space-y-3" onSubmit={resetPlayerPassword}>
                                <label className="select w-full">
                                    <span className="label">Player</span>
                                    <select value={resetUser} onChange={e => { setResetUser(e.target.value); setResetStatus(null); }} required>
                                        <option value="" disabled>Choose a player</option>
                                        {otherPlayers.map(user => <option key={user.id} value={user.username}>{user.username}</option>)}
                                    </select>
                                </label>
                                <label className="floating-label">
                                    <span>New password</span>
                                    <input type="password" className="input w-full" placeholder="New password" autoComplete="new-password" minLength={MIN_PASSWORD} value={resetPassword} onChange={e => setResetPassword(e.target.value)} required />
                                </label>
                                <StatusMessage status={resetStatus} />
                                <button type="submit" className="btn btn-warning" disabled={resetting || !resetUser}>{resetting ? "Resetting…" : "Reset password"}</button>
                            </form>
                        </Card>
                    </div>

                    <div className="mt-6">
                        <Card title="Card database" description="Import new cards and printings from Scryfall. Preview reads the local bulk file without writing anything. Apply local bulk writes the downloaded file to the database. Fetch and apply downloads a fresh file first.">
                            <div className="flex flex-wrap gap-3">
                                <button type="button" className="btn btn-outline" disabled={bulkAction !== "idle"} onClick={previewLocalBulk}>
                                    {bulkAction === "preview" ? "Previewing…" : "Preview local bulk"}
                                </button>
                                <button type="button" className="btn btn-warning btn-outline" disabled={bulkAction !== "idle"} onClick={() => startBulkUpdate(true)}>
                                    Apply local bulk
                                </button>
                                <button type="button" className="btn btn-warning" disabled={bulkAction !== "idle"} onClick={() => startBulkUpdate(false)}>
                                    {bulkAction === "update" ? "Updating…" : "Fetch and apply Scryfall bulk"}
                                </button>
                            </div>
                            {bulkError && <div role="alert" className="alert alert-error alert-soft">{bulkError}</div>}
                            {bulkMessage && (
                                <div role="status" className="alert alert-info alert-soft">
                                    {bulkAction === "update" && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
                                    {bulkMessage}
                                </div>
                            )}
                            {bulkReport && <BulkReportSummary report={bulkReport} onDownload={downloadBulkReport} />}
                        </Card>
                    </div>
                </section>
            )}
        </main>
    );
}

function Card({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
    return (
        <section className="card bg-base-100 shadow-sm">
            <div className="card-body gap-4">
                <div>
                    <h2 className="card-title text-xl">{title}</h2>
                    {description && <p className="text-base-content/70">{description}</p>}
                </div>
                {children}
            </div>
        </section>
    );
}

function StatusMessage({ status }: { status: Status }) {
    if (!status) return null;
    return (
        <div role={status.kind === "error" ? "alert" : "status"} className={`alert alert-soft ${status.kind === "error" ? "alert-error" : "alert-success"}`}>
            {status.text}
        </div>
    );
}

function BulkReportSummary({ report, onDownload }: { report: BulkProcessReport; onDownload: () => void }) {
    const writes = report.database_writes;
    const stats = [
        { label: "Cards scanned", value: report.cards_scanned },
        { label: "English", value: report.english_cards },
        { label: writes ? "New cards" : "New cards (proposed)", value: report.new_cards },
        { label: "Card repairs", value: report.updated_cards },
        { label: "Card backs", value: report.new_card_backs },
        { label: "Printings", value: report.new_printings },
        { label: "Token links", value: report.new_card_tokens },
        { label: "Warnings", value: `${report.warnings.length}${report.warnings_truncated ? "+" : ""}` },
    ];
    return (
        <div className="space-y-3 rounded-box bg-base-200 p-4" role="status">
            <p className="font-semibold">
                {writes ? "Bulk operation complete." : "Preview complete (no database writes)."}{" "}
                <span className="font-normal text-base-content/70">Source: {report.source}. Report: {report.report_file || "not saved"}.</span>
            </p>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map(stat => (
                    <div key={stat.label} className="flex flex-col-reverse rounded-field bg-base-100 p-3">
                        <dt className="text-sm text-base-content/60">{stat.label}</dt>
                        <dd className="text-2xl font-bold">{stat.value}</dd>
                    </div>
                ))}
            </dl>
            <p className="text-sm text-base-content/70">
                Skipped {report.skipped_non_english} non-English, {report.skipped_alchemy} Alchemy and {report.skipped_invalid} invalid. Textless cards: {report.textless_cards}. Unresolved token cards: {report.unresolved_token_cards}.
            </p>
            <button type="button" className="btn btn-outline btn-sm" onClick={onDownload}>Download verification report</button>
            {report.updated_card_ids.length > 0 && <IdList label="Updated card IDs" ids={report.updated_card_ids} />}
            {report.added_card_ids.length > 0 && <IdList label="Added card IDs" ids={report.added_card_ids} />}
            {report.unresolved_token_details.length > 0 && (
                <details>
                    <summary className="cursor-pointer">Unresolved token links ({report.unresolved_token_details.length})</summary>
                    <ul className="mt-2 max-h-48 overflow-auto font-mono text-sm">{report.unresolved_token_details.map(item => <li key={item.card_oracle_id}>{item.card_oracle_id}: missing {item.missing_token_ids.join(", ")}</li>)}</ul>
                </details>
            )}
            {report.warnings.length > 0 && <ul className="list-disc pl-5 text-sm">{report.warnings.slice(0, 5).map((warning, index) => <li key={`${index}-${warning}`}>{warning}</li>)}</ul>}
        </div>
    );
}

function IdList({ label, ids }: { label: string; ids: string[] }) {
    return (
        <details>
            <summary className="cursor-pointer">{label} ({ids.length})</summary>
            <ul className="mt-2 max-h-48 overflow-auto font-mono text-sm">{ids.map(id => <li key={id}>{id}</li>)}</ul>
        </details>
    );
}
