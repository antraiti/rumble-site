export async function PUT(request: Request) {

    const res = await fetch(process.env.API_URL+"/performance", {
        method: 'PUT',
        headers: request.headers,
        body: JSON.stringify(await request.json())
    });
    if(res.ok)
        return Response.json(await res.json());
    else
        return Response.json({});
} 

export async function POST(request: Request) {

    const res = await fetch(process.env.API_URL+"/performance", {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(await request.json())
    });
    if(res.ok)
        return Response.json(await res.json());
    else
        return Response.json({});
} 