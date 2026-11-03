import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { LangProvider } from '@/contexts/LangContext'
import './globals.css'

export const metadata = {
  title: {
    template: '%s | RAILHUB',
    default: 'RAILHUB — Railway Super App',
  },
  description: 'Platform perjalanan kereta api terpadu untuk Pulau Jawa. Pesan tiket, lacak perjalanan, dan nikmati layanan digital berkelas dunia.',
  keywords: ['kereta api', 'tiket kereta', 'KAI', 'booking', 'railway', 'Java'],
  openGraph: {
    title: 'RAILHUB — Railway Super App',
    description: 'Platform perjalanan kereta api terpadu untuk Pulau Jawa.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Roboto+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LangProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  fontFamily: "'Montserrat', sans-serif",
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
      </body>
    </html>
  )
}
