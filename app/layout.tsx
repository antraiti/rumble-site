import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NavBar from './components/NavBar/NavBar'
import { WebHookWrapper } from './components/WebhookWrapper'


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
    <html lang="en" data-theme="mytheme" className='bg-base-200'>
      <body className='bg-base-200'>
        <NavBar/>
        <WebHookWrapper connectionurl={process.env.HOST_URL}>
          {children}
        </WebHookWrapper>
      </body>
    </html>
  )
}
