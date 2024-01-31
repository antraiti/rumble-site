'use client'
import {useEffect, useState} from 'react';
import userData from '../util/UserData';
import EventCard from './EventCard';

interface NewEventData {
  weekly: boolean;
  themed: boolean;
  themeid: number;
  name: string;
}

async function getEvents(token: string) {
    return fetch('api/events', {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token
    }})
    .then(data => {
        if(data.status >= 400) {
            throw new Error("Server responds with error!");
        } else if (data.status === 204) {
            return [];
        }
        return data.json();
    })
}

async function getThemes(token: string) {
  return fetch('api/themes', {
  method: 'GET',
  headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token': token
  }})
  .then(data => {
      if(data.status >= 400) {
          throw new Error("Server responds with error!");
      } else if (data.status === 204) {
          return [];
      }
      return data.json();
  })
}

async function createEvent(token: string, data: NewEventData) {
  return fetch('api/events', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    body: JSON.stringify(data),
    })
  .then(data => {
      if(data.status >= 400) {
        throw new Error("Server responded with error!");
      } else if (data.status === 204) {
        return [];
      }
      return data.json();
    })

}
const isToday = (someDate: any) => {
  const today = new Date()
  const parsed = new Date(Date.parse(someDate))
  return parsed.getDate() === today.getDate() &&
    parsed.getMonth() === today.getMonth() &&
    parsed.getFullYear() === today.getFullYear()
}

export default function Events() {
  const { userToken } = userData();
  const [events, setEvents]  = useState<any>([]);
  const [themeList, setThemeList]  = useState<any>([]);
  const [newEventDetails, setNewEventDetails] = useState<NewEventData>({weekly: true, themed: false, themeid: -1, name: ""} as NewEventData);

  useEffect(() => {
      getEventList();
      getThemes(userToken).then(items => {
        setThemeList(items);
      });
    }, []);
  
  const getEventList = () => {
    getEvents(userToken).then(items => {
      setEvents(items);
    });
  }
  const updateEventDetails = (e: any) => {
    setNewEventDetails((prev) => {
      return {
      ...prev,
      [e.target.name]: e.target.type == "checkbox" ? e.target.checked : e.target.value,
      };
    });
  }

  const createNewEvent = () => {
    createEvent(userToken, newEventDetails).then(res => {
      getEventList();
      (document?.getElementById('new_event_modal') as any | null).close() //this is really something... i hope it works
    })
  } 

  return (
    <div className="flex flex-col h-full w-full justify-around items-center align-middle"> 
      <h1>Latest</h1>
      {events.length > 0 && isToday(events[events.length-1].time) ?
        (<EventCard key={events[events.length-1].id} eventInfo={events[events.length-1]} current={true}/>)
      :
        (<button className='btn btn-outline btn-success m-5 max-w-4xl' onClick={()=>(document.getElementById('new_event_modal') as any | null).showModal()}>Create New Event</button>)
      }
      <h1 className='mt-10'>Archive</h1>
      {events && events?.slice(0).reverse().map((ev: any) => {
          return <EventCard key={ev.id} eventInfo={ev} current={isToday(ev.time)}/>
      })}

      {/* Should move this to its own component to avoid the code bloat here */}
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
                {themeList.map((theme: any) =>{
                  return <option value={theme.id}>{theme.name}</option>
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
            <button className='btn btn-success m-5' onClick={() => createNewEvent()}>Create</button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
