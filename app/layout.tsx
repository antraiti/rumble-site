import type { Metadata } from 'next'
import './globals.css'
import NavBar from './components/NavBar/NavBar'
import { WebHookWrapper } from './components/WebhookWrapper'
import { ThemeWrapper } from './components/ThemeWrapper'
import { DemoModeProvider } from './components/DemoMode'
import { openGraph } from './util/siteMetadata'
import { Nunito } from 'next/font/google'

const nunito = Nunito({
  weight: '400',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  // Link previews need absolute image URLs; set SITE_URL to the public origin (e.g. https://rumble.example).
  metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
  title: { default: 'Rumble MTG', template: '%s | Rumble MTG' },
  description: 'Rumble is a multiplayer Magic: The Gathering format with 60-card singleton decks, 20 starting life, and a legendary commander.',
  openGraph: openGraph('Rumble MTG', 'A multiplayer Magic: The Gathering format with 60-card singleton decks and 20 starting life.'),
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={nunito.className}>
      <ThemeWrapper>
        <DemoModeProvider>
          <NavBar/>
          <WebHookWrapper connectionurl={process.env.HOST_URL}>
            {children}
          </WebHookWrapper>
        </DemoModeProvider>
      </ThemeWrapper>
    </html>
  )
}
