import { proxyFetch } from "../../../../../util/apiProxy";

// Not cached: private fields depend on who is asking.
export async function GET(request: Request, { params }: { params: Promise<{ userid: string }> }) {
    const { userid } = await params;
    const themed = new URL(request.url).searchParams.get("themed") === "true";
    return proxyFetch(request, `/stats/users/${encodeURIComponent(userid)}/matchups?themed=${themed}`);
}
