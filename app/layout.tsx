import type { Metadata } from 'next'
import './globals.css'
import NavBar from './components/NavBar/NavBar'
import { WebHookWrapper } from './components/WebhookWrapper'
import { ThemeWrapper } from './components/ThemeWrapper'
import { Nunito } from 'next/font/google'

const nunito = Nunito({
  weight: '400',
  subsets: ['latin'],
})

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
    <html lang="en" className={nunito.className}>
      <ThemeWrapper>
        <NavBar/>
        <WebHookWrapper connectionurl={process.env.HOST_URL}>
          {children}
        </WebHookWrapper>
      </ThemeWrapper>
    </html>
  )
}
