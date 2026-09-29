import { proxyFetch } from "../../../../util/apiProxy";

export async function GET(request: Request) {
    const themed = new URL(request.url).searchParams.get("themed") === "true";
    return proxyFetch(request, `/stats/global/extra?themed=${themed}`, { revalidate: 60 });
}
