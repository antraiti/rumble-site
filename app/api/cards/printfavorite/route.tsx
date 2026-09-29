import { proxyFetch } from "../../../util/apiProxy";
import { parseBody } from "../../../util/validate";
import { z } from "zod";

const printFavoriteSchema = z.object({
    card: z.string().min(1),
    print: z.string(),
});

export async function GET(request: Request) {
    return proxyFetch(request, "/printfavorite");
}

export async function POST(request: Request) {
    const parsed = await parseBody(request, printFavoriteSchema);
    if ("error" in parsed) return parsed.error;
    return proxyFetch(request, "/printfavorite", { body: parsed.data });
}