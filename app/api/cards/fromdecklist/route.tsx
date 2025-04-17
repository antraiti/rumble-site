export async function POST(request: Request) {
    const res = await fetch(process.env.API_URL+'/fromdecklist', {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(await request.json()),
        next: { revalidate: 60 }}) //minute cache,
        .then(data => {
            if(data.status >= 400) {
                throw new Error("Server responds with error!" + data.status);
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