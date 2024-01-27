'use client';

import { WebSocketProvider } from 'next-ws/client';


export function WebHookWrapper({children, connectionurl}: any) {
    return  <WebSocketProvider
        url={`ws://${connectionurl}/api/ws`}
        // ... other props
    >
    {children}
  </WebSocketProvider>;
}
