import { proxyFetch } from "../../../../util/apiProxy";

export async function PUT(request: Request, { params }: { params: Promise<{ deckid: string }> }) {
    const { deckid } = await params;
    return proxyFetch(request, `/removedeck/${deckid}`);
}