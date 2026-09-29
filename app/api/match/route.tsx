import { proxyFetch } from "../../util/apiProxy";
import { parseBody } from "../../util/validate";
import { z } from "zod";

const matchCreateSchema = z.union([z.number(), z.string()]);
const matchUpdateSchema = z.object({
    prop: z.string().min(1),
    matchid: z.union([z.number(), z.string()]),
});

export async function POST(request: Request) {
    const parsed = await parseBody(request, matchCreateSchema);
    if ("error" in parsed) return parsed.error;
    return proxyFetch(request, "/match", { body: parsed.data });
}

export async function PUT(request: Request) {
    const parsed = await parseBody(request, matchUpdateSchema);
    if ("error" in parsed) return parsed.error;
    return proxyFetch(request, "/match", { body: parsed.data });
}