export async function GET(request: Request) {
    const searchParams = new URLSearchParams(new URL(request.url).searchParams);
    const res = await fetch(process.env.API_URL+`/stats/cards`, {
        method: 'GET',
        headers: request.headers,
        next: { revalidate: 60 }})
        .then(data => {
            if(data.status >= 400) {
                throw new Error("Server responds with error!");
            } else if (data.status === 204) {
                return [];
            }
            return data.json();
        })
    if(res.ok) {
        return Response.json(await res.json());
    }
    else {
        return Response.json(res);
    }
}