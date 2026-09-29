import { proxyFetch } from "../../../util/apiProxy";

export async function GET(request: Request) {
    return proxyFetch(request, "/stats/users", { revalidate: 60 });
}