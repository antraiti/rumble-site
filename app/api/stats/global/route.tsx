import { proxyFetch } from "../../../util/apiProxy";

export async function GET(request: Request) {
    const searchParams = new URLSearchParams(new URL(request.url).searchParams);
    const themed = searchParams.get('themed');
    return proxyFetch(request, `/stats/global/simple${themed ? "?themed="+themed : ""}`, { revalidate: 60 });
}