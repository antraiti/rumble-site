import { proxyFetch } from "../../../../util/apiProxy";

export async function GET(request: Request, { params }: { params: Promise<{ userid: string }> }) {
    const { userid } = await params;
    const search = new URLSearchParams();
    for (const key of ["themed", "from", "to"]) {
        const value = new URL(request.url).searchParams.get(key);
        if (value) search.set(key, value);
    }
    const query = search.toString();
    return proxyFetch(request, `/stats/users/${encodeURIComponent(userid)}${query ? `?${query}` : ""}`, { revalidate: 60 });
}