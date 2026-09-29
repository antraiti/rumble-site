import { proxyFetch } from "../../../util/apiProxy";

export async function POST(request: Request) {
    return proxyFetch(request, "/bulktokens");
}