import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NavBar from './components/NavBar/NavBar'
import { WebHookWrapper } from './components/WebhookWrapper'
import { ThemeWrapper } from './components/ThemeWrapper'
import Cookies from "js-cookie";

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
    //for some reason data theme doesnt work even when directly changed. might be a bug with recent daisyui version upgrade
    <html lang="en" data-theme={Cookies.get("theme")}>
      <ThemeWrapper>
        <NavBar/>
        <WebHookWrapper connectionurl={process.env.HOST_URL}>
          {children}
        </WebHookWrapper>
      </ThemeWrapper>
    </html>
  )
}
