'use client';

import { WebSocketProvider } from 'next-ws/client';


export function WebHookWrapper({children}: any) {
    return  <WebSocketProvider
        url={`ws://${process.env.LOCAL_URL}/api/ws`}
        // ... other props
    >
    {children}
  </WebSocketProvider>;
}