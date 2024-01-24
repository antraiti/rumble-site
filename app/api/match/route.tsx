export async function POST(request: Request) {
    const res = await fetch(process.env.API_URL+`/match`, {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(await request.json())})
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

export async function PUT(request: Request) {
    const res = await fetch(process.env.API_URL+`/match`, {
        method: 'PUT',
        headers: request.headers,
        body: JSON.stringify(await request.json())})
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