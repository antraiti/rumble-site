export async function GET(request: Request) {
    const res = await fetch(process.env.API_URL+'/colors', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }})
        
    if(res.ok)
        return Response.json(await res.json());
    else
        return Response.json({});
}