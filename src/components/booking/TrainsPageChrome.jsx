'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import SearchWidget from '@/components/booking/SearchWidget'
import TrainSceneryVector from '@/components/booking/TrainSceneryVector'
import { useLang } from '@/contexts/LangContext'

export default function TrainsPageChrome({ empty, children }) {
  const { lang } = useLang()
  const [isDay, setIsDay] = useState(true)

  useEffect(() => {
    // Sistem siang/malam HANYA aktif saat halaman input awal (belum klik cari tiket)
    if (!empty) return
    const checkTime = () => {
      const hr = new Date().getHours()
      setIsDay(hr >= 6 && hr < 18)
    }

    checkTime()
    const interval = setInterval(checkTime, 60000)
    return () => clearInterval(interval)
  }, [empty])

  return (
    <>
      {empty && <Navbar />}
      <main
        className={empty ? (isDay ? 'rh-theme-day' : 'rh-theme-night') : ''}
        style={{
          position: 'relative',
          minHeight: '100vh',
          padding: empty ? 'clamp(1.5rem, 4vw, 3rem) 0 clamp(3.5rem, 8vw, 6rem)' : '0.5rem 0 2rem',
          background: empty
            ? (isDay
                ? 'linear-gradient(180deg, #38bdf8 0%, #60a5fa 26%, #93c5fd 54%, #bfdbfe 82%, #e0f2fe 100%)'
                : 'linear-gradient(180deg, #07162c 0%, #0d2857 26%, #12376e 54%, #1a4f94 82%, #07162c 100%)')
            : 'var(--rh-surface)',
          transition: 'background 0.5s ease',
          overflow: empty ? 'hidden' : 'visible',
        }}
      >
        {/* Background Vector Scenery & Express Train: HANYA jika belum pencet cari tiket */}
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
              className="rh-search-page-card rh-search-glass-card"
              style={{
                maxWidth: 620,
                margin: 'clamp(0.5rem, 2.5vw, 1.75rem) auto',
                borderRadius: 'clamp(22px, 4.5vw, 30px)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  padding: 'clamp(1.25rem, 4vw, 2.25rem) clamp(1rem, 3.5vw, 2rem)',
                  textAlign: 'center',
                }}
              >
                {/* Title */}
                <h1
                  className="rh-h3 rh-search-title"
                  style={{
                    margin: '0 0 0.4rem',
                    fontSize: 'clamp(1.3rem, 4vw, 1.7rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.025em',
                  }}
                >
                  {lang === 'en' ? 'Find Train Tickets' : 'Pencarian Tiket Kereta Api'}
                </h1>

                {/* Subtitle */}
                <p
                  className="rh-search-subtitle"
                  style={{
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
