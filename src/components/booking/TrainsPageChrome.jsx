'use client'

import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import SearchWidget from '@/components/booking/SearchWidget'
import { useLang } from '@/contexts/LangContext'

export default function TrainsPageChrome({ empty, children }) {
  const { lang } = useLang()

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', padding: '2rem 0 5rem', background: 'var(--rh-surface)' }}>
        <div className="rh-container">
          <Link href="/" className="rh-btn rh-btn-ghost rh-btn-sm" style={{ marginBottom: '1.25rem' }}>
            <ArrowLeft size={16} aria-hidden="true" /> {lang === 'en' ? 'Back to home' : 'Kembali ke beranda'}
          </Link>
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
