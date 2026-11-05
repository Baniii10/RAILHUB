import { Toaster } from 'react-hot-toast'
import { Suspense } from 'react'
import { Montserrat, Roboto_Mono } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { LangProvider } from '@/contexts/LangContext'
import { ConfirmDialogProvider } from '@/contexts/ConfirmDialogContext'
import RouteTransition from '@/components/layout/RouteTransition'
import Footer from '@/components/layout/Footer'
import WhatsAppBubble from '@/components/layout/WhatsAppBubble'
import './globals.css'

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap' })
const robotoMono = Roboto_Mono({ subsets: ['latin'], variable: '--font-roboto-mono', display: 'swap' })

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#1A428A',
  interactiveWidget: 'resizes-content',
}

export const metadata = {
  title: {
    template: '%s | RAILHUB',
    default: 'RAILHUB - Railway Super App',
  },
  description: 'Platform perjalanan kereta api terpadu untuk Pulau Jawa. Pesan tiket, lacak perjalanan, dan nikmati layanan digital berkelas dunia.',
  keywords: ['kereta api', 'tiket kereta', 'KAI', 'booking', 'railway', 'Java'],
  icons: {
    icon: [
      { url: '/icon.svg?v=2', type: 'image/svg+xml' },
      { url: '/icon.png?v=2', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.ico?v=2', sizes: 'any' },
    ],
    shortcut: '/favicon.ico?v=2',
    apple: '/apple-icon.png?v=2',
  },
  openGraph: {
    title: 'RAILHUB - Railway Super App',
    description: 'Platform perjalanan kereta api terpadu untuk Pulau Jawa.',
    type: 'website',
    images: ['/images/Fix logo railhub.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${montserrat.variable} ${robotoMono.variable}`}>
        <a className="rh-skip-link" href="#main-content">Lewati ke konten utama</a>
        <ConfirmDialogProvider>
          <LangProvider>
          <AuthProvider>
            <Suspense fallback={null}><RouteTransition /></Suspense>
            <div id="main-content" tabIndex={-1}>{children}</div>
            <Suspense fallback={null}><Footer /></Suspense>
            <WhatsAppBubble />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  fontFamily: 'var(--font-montserrat), sans-serif',
                  fontSize: '0.9375rem',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                },
                success: {
                  iconTheme: { primary: 'hsl(142, 70%, 45%)', secondary: 'white' },
                },
                error: {
                  iconTheme: { primary: '#A83232', secondary: 'white' },
                },
              }}
            />
          </AuthProvider>
        </LangProvider>
        </ConfirmDialogProvider>
      </body>
    </html>
  )
}
