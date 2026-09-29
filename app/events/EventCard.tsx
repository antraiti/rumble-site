import Image from "next/image";
import Link from "next/link";
import type { EventInfo } from "../types";

type EventCardProps = {
    eventInfo: EventInfo;
    current?: boolean;
};

export default function EventCard({ eventInfo, current = false }: EventCardProps) {
    const date = new Date(eventInfo.time);
    const displayTime = Number.isNaN(date.getTime())
        ? eventInfo.time
        : date.toLocaleString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });

    return (
        <Link
            href={`/events/${eventInfo.id}`}
            className={`group flex w-full max-w-5xl items-center justify-between gap-4 rounded-lg border bg-base-100 px-4 py-3 transition-colors hover:border-primary/50 hover:bg-base-200 ${current ? "border-success/50" : "border-base-300"}`}
        >
            <div className="flex min-w-0 items-center gap-3">
                <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${current ? "bg-success" : "bg-base-content/20"}`} />
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className="font-semibold leading-snug group-hover:text-primary">{eventInfo.name}</h3>
                        {current && <span className="badge badge-success badge-outline badge-sm">Today</span>}
                        {eventInfo.weekly && <span className="text-xs text-base-content/55">Weekly</span>}
                        {eventInfo.themed && <span className="inline-flex items-center gap-1 text-xs text-info">
                            <Image src="/carnival-mask.svg" alt="" width={16} height={16} />
                            Themed
                        </span>}
                    </div>
                </div>
            </div>
            <time dateTime={eventInfo.time} className="shrink-0 text-right text-sm text-base-content/65">{displayTime}</time>
        </Link>
    );
}
