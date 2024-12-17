export async function POST(request: Request, { params }: { params: { deckid: number } }) {
    const res = await fetch(process.env.API_URL+`/deck/${params.deckid}/steal`, {
        method: 'POST',
        headers: request.headers,
        })
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
        //this is currently broken and always going here
        return Response.json(res);
    }
}