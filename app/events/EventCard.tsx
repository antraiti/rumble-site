import { useRouter } from "next/navigation";

export default function EventCard(eventObject) {
    const router = useRouter();
    const eventInfo = eventObject.eventInfo;

    function GotoEventDetails() {
        router.push(`/events/${eventInfo.id}`);
    }

    return (
        <div onClick={() => GotoEventDetails()} className={`card cursor-pointer bg-primary shadow-lg max-w-4xl w-full h-10 m-2 hover:shadow-accent`}>
            <div className='flex justify-between h-full'>
                <div className="flex mx-5"><article className="flex max-w-none items-center font-bold"><h1 className={`text-xl`}>{eventInfo?.name}</h1></article>
                {eventInfo?.themed && <div className="badge badge-info badge-outline mx-2">Themed</div>}
                </div>
                <article className="flex mx-5 max-w-none items-center"><p className="text-m">{eventInfo?.time}</p></article>
            </div>
        </div>
    );
}
