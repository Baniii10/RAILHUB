'use client'

import { useState, useEffect } from 'react'
import { Search, Train } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import SearchWidget from '@/components/booking/SearchWidget'
import TrainSceneryVector from '@/components/booking/TrainSceneryVector'
import { useLang } from '@/contexts/LangContext'

export default function TrainsPageChrome({ empty, children }) {
  const { lang } = useLang()
  const [isDay, setIsDay] = useState(true)

  useEffect(() => {
    const hr = new Date().getHours()
    setIsDay(hr >= 6 && hr < 18)
  }, [])

  return (
    <>
      {empty && <Navbar />}
      <main
        style={{
          position: 'relative',
          minHeight: '100vh',
          padding: empty ? 'clamp(1.5rem, 4vw, 3rem) 0 clamp(3.5rem, 8vw, 6rem)' : '0.5rem 0 1.5rem',
          background: empty
            ? isDay
              ? 'linear-gradient(180deg, #0284c7 0%, #0ea5e9 26%, #38bdf8 54%, #7dd3fc 82%, #bae6fd 100%)'
              : 'linear-gradient(180deg, #07162c 0%, #0d2857 26%, #12376e 54%, #1a4f94 82%, #1e5cb3 100%)'
            : 'var(--rh-surface)',
          overflow: empty ? 'hidden' : 'visible',
          transition: 'background 0.6s ease',
        }}
      >
        {/* Background Vector Scenery & Express Train (Siang / Malam) */}
        {empty && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 0,
              overflow: 'hidden',
            }}
          >
            <TrainSceneryVector isDay={isDay} />
          </div>
        )}

        <div
          className="rh-container"
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 clamp(0.75rem, 3vw, 1.5rem)',
          }}
        >
          {empty ? (
            <section
              className="rh-search-page-card"
              style={{
                maxWidth: 620,
                margin: 'clamp(0.5rem, 2.5vw, 1.75rem) auto',
                background: '#ffffff',
                borderRadius: 'clamp(20px, 4vw, 26px)',
                boxShadow: '0 25px 60px -12px rgba(5, 17, 36, 0.45), 0 8px 24px -6px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: 'clamp(1.25rem, 4vw, 2.25rem) clamp(1rem, 3.5vw, 2rem)',
                  textAlign: 'center',
                }}
              >
                {/* Search Icon Badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 52,
                    height: 52,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    border: '1px solid #bfdbfe',
                    color: '#2563eb',
                    margin: '0 auto 0.85rem',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.12)',
                  }}
                >
                  <Search size={26} strokeWidth={2.4} aria-hidden="true" />
                </div>

                {/* Official Pill */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      background: 'rgba(37, 99, 235, 0.08)',
                      color: '#1d4ed8',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}
                  >
                    <Train size={13} strokeWidth={2.5} />
                    {lang === 'en' ? 'Official Train Ticketing' : 'Pemesanan Resmi Tiket Kereta Api'}
                  </span>
                </div>

                {/* Title */}
                <h1
                  className="rh-h3"
                  style={{
                    margin: '0 0 0.4rem',
                    color: '#0f172a',
                    fontSize: 'clamp(1.3rem, 4vw, 1.7rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.025em',
                  }}
                >
                  {lang === 'en' ? 'Find Train Tickets' : 'Pencarian Tiket Kereta Api'}
                </h1>

                {/* Subtitle */}
                <p
                  style={{
                    color: '#64748b',
                    margin: '0 0 1.5rem',
                    fontSize: 'clamp(0.85rem, 2.5vw, 0.92rem)',
                    lineHeight: 1.5,
                    maxWidth: 480,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}
                >
                  {lang === 'en'
                    ? 'Choose your origin, destination, and departure date.'
                    : 'Pilih stasiun asal, stasiun tujuan, dan tanggal keberangkatan.'}
                </p>

                {/* Search Form */}
                <div style={{ textAlign: 'left' }}>
                  <SearchWidget />
                </div>
              </div>
            </section>
          ) : (
            children
          )}
        </div>
      </main>
    </>
  )
}
