'use client'
import {useEffect, useState} from 'react';
import userData from '../util/UserData';
import EventCard from './EventCard';
import { apiGet, apiPost } from '../util/apiClient';
import PageHeader from '../components/PageHeader';
import type { EventInfo, Theme } from '../types';

interface NewEventData {
  weekly: boolean;
  themed: boolean;
  themeid: number;
  name: string;
}

async function getEvents(token: string) {
    return apiGet<EventInfo[]>('events', { token });
}

async function getThemes(token: string) {
  return apiGet<Theme[]>('themes', { token });
}

async function createEvent(token: string, data: NewEventData) {
  return apiPost('events', { token, body: data });
}
const isToday = (someDate: string) => {
  const today = new Date()
  const parsed = new Date(someDate)
  if (Number.isNaN(parsed.getTime())) return false
  return parsed.getDate() === today.getDate() &&
    parsed.getMonth() === today.getMonth() &&
    parsed.getFullYear() === today.getFullYear()
}

const eventModal = () => document.getElementById('new_event_modal') as HTMLDialogElement | null;

export default function Events() {
  const { userToken } = userData();
  const [events, setEvents]  = useState<EventInfo[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [themeList, setThemeList]  = useState<Theme[]>([]);
  const [newEventDetails, setNewEventDetails] = useState<NewEventData>({weekly: true, themed: false, themeid: -1, name: ""} as NewEventData);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const getEventList = () => {
    getEvents(userToken)
      .then(items => { setEvents(items ?? []); setLoadError(false); })
      .catch(() => setLoadError(true));
  }

  useEffect(() => {
      getEventList();
      getThemes(userToken).then(items => {
        setThemeList(items ?? []);
      }).catch(() => setThemeList([]));
    }, []);

  const updateEventDetails = (e: any) => {
    setNewEventDetails((prev) => {
      return {
      ...prev,
      [e.target.name]: e.target.type == "checkbox" ? e.target.checked : e.target.value,
      };
    });
  }

  const createNewEvent = () => {
    setCreating(true);
    setCreateError("");
    createEvent(userToken, newEventDetails)
      .then(() => {
        getEventList();
        eventModal()?.close();
      })
      .catch(error => setCreateError(error instanceof Error && error.message ? error.message : "Couldn't create the event."))
      .finally(() => setCreating(false));
  }

  const sortedEvents = [...(events ?? [])].sort((first: EventInfo, second: EventInfo) => Date.parse(second.time) - Date.parse(first.time));
  const currentEvent = sortedEvents.find((event: EventInfo) => isToday(event.time));
  const archiveEvents = sortedEvents.filter((event: EventInfo) => event.id !== currentEvent?.id);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Rumble / Community"
        title="Events"
        actions={userToken && <button type="button" className="btn btn-primary" onClick={() => eventModal()?.showModal()}>Create event</button>}
      >
        Game nights and themed events. Open today&apos;s event to track matches live.
      </PageHeader>

      {loadError ? (
        <div role="alert" className="alert alert-error mt-6">
          <span>Couldn&apos;t load events.</span>
          <button type="button" className="btn btn-sm" onClick={getEventList}>Try again</button>
        </div>
      ) : events === null ? (
        <div className="mt-6 space-y-2" aria-busy="true">
          {[0, 1, 2, 3].map(index => <div key={index} className="skeleton h-14 w-full" />)}
        </div>
      ) : <>
      <section aria-labelledby="today-heading" className="pt-6">
        <h2 id="today-heading" className="mb-3 text-lg font-semibold">Today</h2>
        {currentEvent ? <EventCard eventInfo={currentEvent} current /> : (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-dashed border-base-content/20 px-4 py-5">
            <p className="text-sm text-base-content/70">No event scheduled today.</p>
            <button className="btn btn-outline btn-success btn-sm" onClick={() => eventModal()?.showModal()}>
              Create event
            </button>
          </div>
        )}
      </section>

      <section aria-labelledby="archive-heading" className="mt-10">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 id="archive-heading" className="text-lg font-semibold">Archive</h2>
          <span className="font-mono text-xs text-base-content/50">{archiveEvents.length}</span>
        </div>
        {archiveEvents.length > 0 ? (
          <div className="space-y-2">
            {archiveEvents.map((event: EventInfo) => <EventCard key={event.id} eventInfo={event} />)}
          </div>
        ) : <p className="rounded-lg border border-dashed border-base-content/20 px-4 py-5 text-sm text-base-content/60">No archived events yet.</p>}
      </section>
      </>}

      <dialog id="new_event_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg mb-5">New Event</h3>
          <div className="form-control">
            <label className="cursor-pointer label">
              <span className="label-text">Wednesday Night Weekly</span>
              <input type="checkbox" name="weekly" checked={newEventDetails?.weekly} onChange={e => updateEventDetails(e)} className="checkbox checkbox-warning"/>
            </label>
            <div className="divider"></div> 
            <label className="cursor-pointer label">
              <span className="label-text">Themed</span>
              <input type="checkbox" name="themed" checked={newEventDetails?.themed} onChange={e => updateEventDetails(e)} className="checkbox checkbox-info"/>
            </label>
            {newEventDetails?.themed && <label className="cursor-pointer label">
              <span className="label-text">Theme</span>
              <select name="themeid" value={newEventDetails?.themeid} onChange={e => updateEventDetails(e)} className="select select-bordered w-full max-w-xs">
                <option value={-1}>Select Theme</option>
                {themeList.map(theme =>{
                  return <option key={theme.id} value={theme.id}>{theme.name}</option>
                })}
              </select>
            </label>}
            <div className="divider"></div>
            {(!newEventDetails?.weekly || newEventDetails?.themed) && <div><label className="cursor-pointer label">
              <span className="label-text">{newEventDetails?.weekly ? "Weekly X:" : "Custom Name"}</span>
              <input type="text" name="name" value={newEventDetails?.name} onChange={e => updateEventDetails(e)} className="input input-bordered w-full max-w-xs"/>
              </label>
              <div className="divider"></div>
            </div>}
            {createError && <div role="alert" className="alert alert-error alert-soft mt-3">{createError}</div>}
            <button className='btn btn-success m-5' onClick={() => createNewEvent()} disabled={creating}>
              {creating && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
              Create
            </button>
          </div>
        </div>
      </dialog>
    </main>
  )
}
