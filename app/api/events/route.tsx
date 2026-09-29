import { proxyFetch } from "../../util/apiProxy";
import { parseBody } from "../../util/validate";
import { z } from "zod";

const eventCreateSchema = z.object({
    weekly: z.boolean(),
    themed: z.boolean(),
    themeid: z.number(),
    name: z.string(),
});

export async function GET(request: Request) {
    return proxyFetch(request, "/event");
}

export async function POST(request: Request) {
    const parsed = await parseBody(request, eventCreateSchema);
    if ("error" in parsed) return parsed.error;
    return proxyFetch(request, "/event", { body: parsed.data });
}


