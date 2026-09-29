import { proxyFetch } from "../../../../util/apiProxy";

export async function POST(request: Request) {
  const { search } = new URL(request.url);
  return proxyFetch(request, `/bulkprocess/dry-run${search}`);
}