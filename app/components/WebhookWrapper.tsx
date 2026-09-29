'use client';

import type { ReactNode } from 'react';
import { WebSocketProvider } from 'next-ws/client';

export function WebHookWrapper({ children, connectionurl }: { children: ReactNode; connectionurl?: string }) {
  const host = connectionurl?.trim() || 'localhost:3000';
  const url = new URL(host.includes('://') ? host : `http://${host}`);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/api/ws';
  url.search = '';
  url.hash = '';

  return <WebSocketProvider url={url.toString()}>{children}</WebSocketProvider>;
}
