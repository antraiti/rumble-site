import { proxyFetch } from "../../../../util/apiProxy";

export async function GET(request: Request) {
    return proxyFetch(request, "/stats/cards/custom", { revalidate: 60 });
}