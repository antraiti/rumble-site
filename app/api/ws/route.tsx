// app/api/ws/route.ts (can be any route file in the app directory)
let clients: any[] = [];


export function SOCKET(
    client: import('ws').WebSocket,
    request: import('http').IncomingMessage,
    server: import('ws').WebSocketServer,
  ) {
    console.log('A client connected!');
    clients.push(client);

    client.on('message', message => {
      clients.forEach(c => {c.send(message)})
    });
    
    client.on('close', () => {
        clients.splice(clients.indexOf(client),1);
      console.log('A client disconnected!');
    });
  }
//DUMMY GET METHOD TO MAKE NEXTJS HAPPY :)
export async function GET(request: Request) {
    return Response.json("buh");
}