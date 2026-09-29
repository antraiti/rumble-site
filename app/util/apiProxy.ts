// Shared helper for app/api/**/route.tsx handlers that proxy to the external API_URL backend.
interface ProxyOptions {
  method?: string;
  body?: unknown;
  headers?: HeadersInit;
  /** Next.js fetch cache revalidation window, in seconds. */
  revalidate?: number;
}

// Hop-by-hop / host-scoped headers that must not be blindly forwarded to a different origin.
const UNSAFE_FORWARD_HEADERS = ['host', 'connection', 'content-length', 'cookie', 'transfer-encoding'];

function sanitizeForwardHeaders(headers: HeadersInit): Headers {
  const result = new Headers(headers);
  for (const name of UNSAFE_FORWARD_HEADERS) result.delete(name);
  return result;
}

export async function proxyFetch(request: Request, path: string, opts: ProxyOptions = {}): Promise<Response> {
  const init: RequestInit & { next?: { revalidate: number } } = {
    method: opts.method ?? request.method,
    headers: sanitizeForwardHeaders(opts.headers ?? request.headers),
  };
  if (opts.body !== undefined) init.body = JSON.stringify(opts.body);
  if (opts.revalidate !== undefined) init.next = { revalidate: opts.revalidate };

  const res = await fetch(`${process.env.API_URL}${path}`, init);

  if (res.status === 204) return Response.json([], { status: 204 });

  const data = await res.json().catch(() => null);
  return Response.json(data, { status: res.status });
}
