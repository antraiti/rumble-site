import { proxyFetch } from "../../util/apiProxy";
import { parseBody } from "../../util/validate";
import { z } from "zod";

const deckCreateSchema = z.object({
    user: z.union([z.number(), z.string()]),
    list: z.string().min(1),
    name: z.string().min(1),
});

export async function POST(request: Request) {
    const parsed = await parseBody(request, deckCreateSchema);
    if ("error" in parsed) return parsed.error;
    return proxyFetch(request, "/deck/v2", { body: parsed.data });
}