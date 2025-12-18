export async function GET(request: Request, { params }: { params: Promise<{ userid: string }> }) {
    const { userid } = await params;
    const res = await fetch(process.env.API_URL+`/stats/users/${userid}`, {
        method: 'GET',
        headers: request.headers})
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