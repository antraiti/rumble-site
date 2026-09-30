// Shared client-side fetch helper for calling this app's own /api/* routes from page components.
interface ApiOptions {
  token?: string;
  body?: unknown;
}

async function request<T>(method: string, path: string, opts?: ApiOptions): Promise<T> {
  const res = await fetch(`/api/${path}`, {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(opts?.token ? { 'x-access-token': opts.token } : {}),
    },
    body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status >= 400) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || body?.message || `Server responds with error! (${res.status})`);
  }
  if (res.status === 204) return [] as unknown as T;
  return res.json();
}

export const apiGet = <T = any>(path: string, opts?: ApiOptions) => request<T>('GET', path, opts);
export const apiPost = <T = any>(path: string, opts?: ApiOptions) => request<T>('POST', path, opts);
export const apiPut = <T = any>(path: string, opts?: ApiOptions) => request<T>('PUT', path, opts);
export const apiDelete = <T = any>(path: string, opts?: ApiOptions) => request<T>('DELETE', path, opts);
