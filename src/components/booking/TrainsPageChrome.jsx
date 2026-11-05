'use client'

import { Search } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import SearchWidget from '@/components/booking/SearchWidget'
import { useLang } from '@/contexts/LangContext'

export default function TrainsPageChrome({ empty, children }) {
  const { lang } = useLang()

  return (
    <>
      {empty && <Navbar />}
      <main style={{ minHeight: '100vh', padding: empty ? '2rem 0 5rem' : '0.5rem 0 1.5rem', background: 'var(--rh-surface)' }}>
        <div className="rh-container">
          {empty ? (
            <section className="rh-card" style={{ maxWidth: 640, margin: '1.5rem auto', textAlign: 'center' }}>
              <div className="rh-card-body" style={{ padding: '2.5rem 1.75rem' }}>
                <Search size={32} aria-hidden="true" style={{ color: 'var(--rh-primary)', margin: '0 auto 1rem' }} />
                <h1 className="rh-h3" style={{ margin: '0 0 0.5rem' }}>{lang === 'en' ? 'Find Train Tickets' : 'Pencarian Tiket Kereta Api'}</h1>
                <p style={{ color: 'var(--rh-text-2)', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>
                  {lang === 'en' ? 'Choose your origin, destination, and departure date.' : 'Pilih stasiun asal, stasiun tujuan, dan tanggal keberangkatan.'}
                </p>
                <div style={{ textAlign: 'left' }}><SearchWidget /></div>
              </div>
            </section>
          ) : children}
        </div>
      </main>
    </>
  )
}
