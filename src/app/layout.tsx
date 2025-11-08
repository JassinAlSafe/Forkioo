import type { Metadata } from 'next'
import { Inter, Lexend } from 'next/font/google'
import './globals.css'

// Primary font: Inter - Modern, highly readable UI font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
})

// Display font: Lexend - Designed for readability, perfect for headings
const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
})

export const metadata: Metadata = {
  title: 'Forkioo - Modern Booking Made Simple',
  description: 'Professional booking and scheduling platform built for modern businesses',
  keywords: ['booking', 'scheduling', 'appointments', 'calendar', 'reservations'],
  authors: [{ name: 'Forkioo Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0ea5e9',
  openGraph: {
    title: 'Forkioo - Modern Booking Made Simple',
    description: 'Professional booking and scheduling platform built for modern businesses',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${lexend.variable}`}>
      <body className="font-sans antialiased bg-neutral-50 text-neutral-900">
        {children}
      </body>
    </html>
  )
}
