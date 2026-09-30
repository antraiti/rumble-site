// Shared client-side fetch helper for calling this app's own /api/* routes from page components.
import Cookies from 'js-cookie';

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
    // Expired or revoked session: drop the stale cookie and send the user to sign in again.
    if (res.status === 401 && opts?.token && body?.code === 'invalid_token') {
      Cookies.remove('userdata');
      window.location.href = '/login';
    }
    throw new Error(body?.error || body?.message || `Server responds with error! (${res.status})`);
  }
  if (res.status === 204) return [] as unknown as T;
  return res.json();
}

export const apiGet = <T = any>(path: string, opts?: ApiOptions) => request<T>('GET', path, opts);
export const apiPost = <T = any>(path: string, opts?: ApiOptions) => request<T>('POST', path, opts);
export const apiPut = <T = any>(path: string, opts?: ApiOptions) => request<T>('PUT', path, opts);
export const apiDelete = <T = any>(path: string, opts?: ApiOptions) => request<T>('DELETE', path, opts);
