import { proxyFetch } from "../../util/apiProxy";

export async function GET(request: Request) {
    return proxyFetch(request, "/colors", {
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        revalidate: 3600,
    });
}