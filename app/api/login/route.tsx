export async function POST(request: Request) {
    const response = await fetch(`${process.env.API_URL}/login`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(await request.json()),
    });

    if (response.status === 200) {
        return Response.json(await response.json());
    }

    return Response.json({});
}
