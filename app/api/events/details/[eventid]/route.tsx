import { proxyFetch } from "../../../../util/apiProxy";

export async function GET(request: Request, { params }: { params: Promise<{ eventid: string }> }) {
    const {eventid} = await params;
    return proxyFetch(request, `/event/${eventid}`);
}