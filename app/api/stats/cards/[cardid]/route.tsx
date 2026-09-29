import { proxyFetch } from "../../../../util/apiProxy";

// Not cached: the response includes the requester's own record with the card.
export async function GET(request: Request, { params }: { params: Promise<{ cardid: string }> }) {
    const { cardid } = await params;
    return proxyFetch(request, `/stats/cards/${encodeURIComponent(cardid)}`);
}
