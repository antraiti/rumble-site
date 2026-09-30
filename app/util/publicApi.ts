// Server-side fetch for API endpoints that need no auth; returns null when the API is unavailable.
export async function fetchPublic<T>(path: string, revalidate: number): Promise<T | null> {
    try {
        const response = await fetch(`${process.env.API_URL}${path}`, { headers: { Accept: "application/json" }, next: { revalidate } });
        return response.ok ? ((await response.json()) as T) : null;
    } catch {
        return null;
    }
}
