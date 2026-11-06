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
              className={`rh-search-page-card ${!isDay ? "rh-night-theme" : ""}`}
              style={{
                maxWidth: 620,
                margin: 'clamp(0.5rem, 2.5vw, 1.75rem) auto',
                background: isDay ? 'rgba(255, 255, 255, 0.76)' : 'rgba(10, 25, 48, 0.78)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                borderRadius: 'clamp(20px, 4vw, 26px)',
                boxShadow: isDay
                  ? '0 25px 60px -12px rgba(2, 44, 102, 0.28), 0 10px 30px -8px rgba(0, 0, 0, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.9)'
                  : '0 25px 60px -12px rgba(0, 0, 0, 0.55), 0 10px 30px -8px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                border: isDay ? '1.5px solid rgba(255, 255, 255, 0.85)' : '1.5px solid rgba(255, 255, 255, 0.18)',
                overflow: 'hidden',
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
                  className="rh-h3"
                  style={{
                    margin: '0 0 0.4rem',
                    color: isDay ? '#0f172a' : '#ffffff',
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
                    color: isDay ? '#64748b' : 'rgba(255, 255, 255, 0.85)',
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
                  <SearchWidget isNight={!isDay} />
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
