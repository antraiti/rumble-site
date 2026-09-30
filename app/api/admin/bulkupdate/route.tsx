import { proxyFetch } from "../../../util/apiProxy";

export async function POST(request: Request) {
  const local = new URL(request.url).searchParams.get("source") === "local";
  return proxyFetch(request, local ? "/bulkupdate?source=local" : "/bulkupdate");
}