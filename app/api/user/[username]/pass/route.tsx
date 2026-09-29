import { proxyFetch } from "../../../../util/apiProxy";
import { parseBody } from "../../../../util/validate";
import { z } from "zod";

const passwordSchema = z.string().min(1);

export async function PUT(request: Request, { params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const parsed = await parseBody(request, passwordSchema);
    if ("error" in parsed) return parsed.error;
    return proxyFetch(request, `/user/${username}/pass`, { body: parsed.data });
}