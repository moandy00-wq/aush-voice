import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/ThemeProvider'
import { SmoothScroll } from '@/components/SmoothScroll'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aush Voice — AI-Powered Voice Receptionist',
  description: 'Smart AI receptionist that handles calls, schedules appointments, and manages contacts automatically.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider>
          <SmoothScroll />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
