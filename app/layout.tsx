import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NavBar from './components/NavBar/NavBar'
import { WebHookWrapper } from './components/WebhookWrapper'
import { ThemeWrapper } from './components/ThemeWrapper'


export const metadata: Metadata = {
  title: 'Rumble MTG',
  description: 'The official site of the alternative multiplayer format',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeWrapper>
      <NavBar/>
      <WebHookWrapper connectionurl={process.env.HOST_URL}>
        {children}
      </WebHookWrapper>
    </ThemeWrapper>
  )
}
