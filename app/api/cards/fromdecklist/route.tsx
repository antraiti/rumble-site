import { proxyFetch } from "../../../util/apiProxy";
import { parseBody } from "../../../util/validate";
import { z } from "zod";

const decklistSchema = z.string().min(1);

export async function POST(request: Request) {
    const parsed = await parseBody(request, decklistSchema);
    if ("error" in parsed) return parsed.error;
    return proxyFetch(request, "/fromdecklist", { body: parsed.data, revalidate: 60 });
}