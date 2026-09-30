// app/api/ws/route.ts (can be any route file in the app directory)
import type { WebSocket } from 'ws';

const clients = new Set<WebSocket>();

// Relays each message to every other open client; pages filter by message type/event themselves.
export function SOCKET(
    client: WebSocket,
    request: import('http').IncomingMessage,
    server: import('ws').WebSocketServer,
  ) {
    clients.add(client);

    client.on('message', (message, isBinary) => {
      clients.forEach(c => {
        if (c !== client && c.readyState === c.OPEN) c.send(message, { binary: isBinary });
      });
    });
    
    client.on('close', () => {
        clients.delete(client);
    });
  }
//DUMMY GET METHOD TO MAKE NEXTJS HAPPY :)
export async function GET(request: Request) {
    return Response.json("buh");
}