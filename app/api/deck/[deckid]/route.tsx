import { proxyFetch } from "../../../util/apiProxy";
import { parseBody } from "../../../util/validate";
import { z } from "zod";

const deckUpdateSchema = z.object({
    prop: z.string().min(1),
    val: z.string(),
});

export async function GET(request: Request, { params }: { params: Promise<{ deckid: string }>}) {
    const { deckid } = await params;
    return proxyFetch(request, `/deck/v2/${deckid}`);
}

export async function PUT(request: Request, { params }: { params: Promise<{ deckid: string }> }) {
    const { deckid } = await params;
    const parsed = await parseBody(request, deckUpdateSchema);
    if ("error" in parsed) return parsed.error;
    return proxyFetch(request, `/deck/v2/${deckid}`, { body: parsed.data });
}