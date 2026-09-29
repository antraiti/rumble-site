import { proxyFetch } from "../../util/apiProxy";
import { parseBody } from "../../util/validate";
import { z } from "zod";

const performanceUpdateSchema = z.object({ id: z.union([z.number(), z.string()]) }).catchall(z.any());
const performanceCreateSchema = z.object({
    userid: z.union([z.number(), z.string()]),
    matchid: z.union([z.number(), z.string()]),
});

export async function PUT(request: Request) {
    const parsed = await parseBody(request, performanceUpdateSchema);
    if ("error" in parsed) return parsed.error;
    return proxyFetch(request, "/performance", { body: parsed.data });
}

export async function POST(request: Request) {
    const parsed = await parseBody(request, performanceCreateSchema);
    if ("error" in parsed) return parsed.error;
    return proxyFetch(request, "/performance", { body: parsed.data });
}
