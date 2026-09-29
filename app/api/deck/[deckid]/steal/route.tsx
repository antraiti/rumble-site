import { proxyFetch } from "../../../../util/apiProxy";

export async function POST(request: Request, { params }: { params: Promise<{ deckid: string }> }) {
    const { deckid } = await params;
    return proxyFetch(request, `/deck/${deckid}/steal`);
}