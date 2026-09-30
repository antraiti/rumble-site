'use client'

import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { useWebSocket } from 'next-ws/client';
import userData from "../../util/UserData"
import MatchCard from "./MatchCard";
import { apiGet, apiPost, apiPut } from "../../util/apiClient";

const EVENT_UPDATED = "event-updated";

type EventDetails = {
    event: { id: number; name: string; themed: boolean; weekly: boolean };
    theme: { name: string; stylename: string } | null;
    matches: { match: { id: number; name: string; power: number; start: string | null; end: string | null }; performances: { id: number; userid: number; username: string; deckid: number | null; placement: number | null; order: number | null; killedby: number | null }[] }[];
    decks: unknown[];
};

async function updatePerformance(token: string, id: number, key: string, val: string) {
    if (key === "delete") return apiPut('performance', { token, body: { id, delete: true } });
    const numericFields = ['deckid', 'placement', 'order', 'killedbyuid'];
    const nullableFields = ['deckid', 'placement', 'order'];
    const clearField = val === '' && nullableFields.includes(key);
    const value = numericFields.includes(key) && val !== '' ? Number(val) : val;
    const body = clearField ? { id, clear: key } : { id, [key]: value };
    return apiPut('performance', { token, body });
}

function shuffle<T>(items: T[]) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

export default function EventPage({ params }: { params: Promise<{ eventid: number }> }) {
    const { eventid } = React.use(params);
    const { userToken, userId } = userData();
    const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
    const [loadError, setLoadError] = useState(false);
    const [actionError, setActionError] = useState("");
    const [userList, setUserList] = useState<{ id: number; username: string }[]>([]);
    const ws = useWebSocket();

    const refresh = useCallback(() => {
        apiGet<EventDetails>(`events/details/${eventid}`, { token: userToken })
            .then(data => { setEventDetails(data); setLoadError(false); })
            .catch(() => setLoadError(true));
    }, [eventid, userToken]);

    useEffect(() => {
        // Other events share the relay, so only react to updates for this one.
        const onMessage = async (message: MessageEvent) => {
            const text = typeof message.data === "string" ? message.data : await (message.data as Blob).text?.();
            try {
                const update = JSON.parse(text ?? "");
                if (update?.type === EVENT_UPDATED && Number(update.eventId) === Number(eventid)) refresh();
            } catch {
                // Ignore messages that aren't ours.
            }
        };
        ws?.addEventListener('message', onMessage);
        refresh();
        apiGet<{ id: number; username: string }[]>('users', { token: userToken }).then(setUserList).catch(() => setUserList([]));
        return () => ws?.removeEventListener('message', onMessage);
    }, [ws, eventid, userToken, refresh]);

    // Runs an update, tells other viewers of this event, then refreshes our own copy.
    function run(action: Promise<unknown>) {
        setActionError("");
        action
            .then(() => {
                ws?.send(JSON.stringify({ type: EVENT_UPDATED, eventId: Number(eventid) }));
                refresh();
            })
            .catch(error => setActionError(error instanceof Error && error.message ? error.message : "That change didn't save. Try again."));
    }

    const updateMatch = (e: { target: { name: string; value: string } }, perfid: number) => run(updatePerformance(userToken, perfid, e.target.name, e.target.value));
    const requestNewMatch = () => run(apiPost('match', { token: userToken, body: eventid }));
    const requestMatchTimestampUpdate = (matchid: number, prop: string) => run(apiPut('match', { token: userToken, body: { prop, matchid } }));
    const requestNewPerformance = (userid: string, matchid: number) => run(apiPost('performance', { token: userToken, body: { userid, matchid } }));
    const requestMatchJoin = (matchid: number) => run(apiPost('performance', { token: userToken, body: { userid: userId, matchid } }));
    const setMatchPower = (matchid: number, power: string) => run(apiPut('match', { token: userToken, body: { prop: power, matchid } }));
    const randomizeTurnOrder = (matchid: number) => {
        const match = eventDetails?.matches.find(m => m.match.id === matchid);
        if (!match) return;
        const seats = shuffle(match.performances.map((_, index) => index + 1));
        run(Promise.all(match.performances.map((performance, index) => updatePerformance(userToken, performance.id, "order", String(seats[index])))));
    };

    if (loadError && !eventDetails) {
        return (
            <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
                <div role="alert" className="alert alert-error">
                    <span>Couldn&apos;t load this event.</span>
                    <button type="button" className="btn btn-sm" onClick={refresh}>Try again</button>
                </div>
            </main>
        );
    }

    if (!eventDetails) {
        return (
            <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8" aria-busy="true">
                <div className="skeleton h-24 w-full" />
                {[0, 1].map(index => <div key={index} className="skeleton mt-6 h-64 w-full" />)}
            </main>
        );
    }

    const { event, theme } = eventDetails;
    const themedWeekly = event.weekly && event.themed;
    const [series, title] = themedWeekly && event.name.includes(": ") ? event.name.split(": ", 2) : ["", event.name];
    // Players already in an unfinished match can't be added to another one.
    const busy = new Set(eventDetails.matches.filter(m => !m.match.end).flatMap(m => m.performances.map(p => p.userid)));
    const availablePlayers = userList.filter(user => !busy.has(user.id));

    return (
        <div className="min-h-screen bg-base-200" data-theme={event.themed && theme?.stylename ? theme.stylename : "mytheme"}>
            <main className="mx-auto w-full max-w-6xl px-2 py-6 sm:px-6">
                <header className="mx-3 flex flex-wrap items-end justify-between gap-4 border-b border-base-content/15 pb-5 sm:mx-5">
                    <div className="min-w-0">
                        <p className="text-sm font-bold uppercase text-primary"><Link href="/events" className="link link-hover">Rumble / Events</Link>{series && ` / ${series}`}</p>
                        <h1 className="mt-1 break-words text-4xl font-black">{title}</h1>
                        <p className="mt-2 text-base-content/70">{event.themed ? `Theme: ${theme?.name ?? "Unknown"}` : "No theme"}</p>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={requestNewMatch}>Create match</button>
                </header>

                {actionError && (
                    <div role="alert" className="alert alert-warning alert-soft mx-3 mt-4 sm:mx-5">
                        <span>{actionError}</span>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setActionError("")}>Dismiss</button>
                    </div>
                )}

                {eventDetails.matches.length === 0 && (
                    <div className="mx-3 mt-6 rounded-box border border-dashed border-base-content/20 px-6 py-12 text-center sm:mx-5">
                        <p className="text-lg font-semibold">No matches yet</p>
                        <p className="mt-1 text-base-content/70">Create a match, then add players.</p>
                    </div>
                )}

                {eventDetails.matches.slice(0).reverse().map(match => (
                    <MatchCard
                        key={match.match.id}
                        matchInfo={match}
                        decks={eventDetails.decks}
                        updateMatch={updateMatch}
                        userlist={availablePlayers}
                        addPerformance={requestNewPerformance}
                        updateTimestamp={requestMatchTimestampUpdate}
                        requestMatchJoin={requestMatchJoin}
                        setMatchPower={setMatchPower}
                        randomizeTurnOrder={randomizeTurnOrder}
                        themed={event.themed}
                    />
                ))}
            </main>
        </div>
    );
}
