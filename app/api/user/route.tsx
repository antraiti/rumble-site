import { proxyFetch } from "../../util/apiProxy";
import { parseBody } from "../../util/validate";
import { z } from "zod";

const userCreateSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
});

export async function POST(request: Request) {
    const parsed = await parseBody(request, userCreateSchema);
    if ("error" in parsed) return parsed.error;
    return proxyFetch(request, "/user", { body: parsed.data });
}