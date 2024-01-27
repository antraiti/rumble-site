export async function POST(request: Request) {
    const res = await fetch(process.env.API_URL+"/login", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(await request.json())
    });
    
    if(res.status == 200)
        return Response.json(await res.json());
    else
        return Response.json({});
} 