import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/components/ui'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Univo - Video Conferencing Platform',
  description: 'A comprehensive video conferencing platform with AI integrations for corporate meetings and educational industries.',
  keywords: ['video conferencing', 'online meetings', 'education', 'AI transcription', 'collaboration'],
  authors: [{ name: 'Univio Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <ToastProvider>
          <AuthProvider>
            <div id="root" className="h-full">
              {children}
            </div>
            <div id="modal-root" />
            <div id="tooltip-root" />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}