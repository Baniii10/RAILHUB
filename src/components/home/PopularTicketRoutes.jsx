'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, ArrowRight, ChevronRight } from 'lucide-react'
import { useLang } from '@/contexts/LangContext'

const POPULAR_ROUTES = [
  {
    from: 'GMR',
    fromName: 'Gambir',
    cityFrom: 'Jakarta',
    to: 'BD',
    toName: 'Bandung',
    duration: '3 Jam',
    price: 'Mulai Rp 150.000',
    originalPrice: 'Rp 185.000',
    tag: 'Favorit Akhir Pekan',
    enTag: 'Weekend Favorite',
  },
  {
    from: 'GMR',
    fromName: 'Gambir',
    cityFrom: 'Jakarta',
    to: 'YK',
    toName: 'Yogyakarta',
    duration: '7 Jam',
    price: 'Mulai Rp 250.000',
    originalPrice: 'Rp 310.000',
    tag: 'Rute Wisata',
    enTag: 'Leisure Route',
  },
  {
    from: 'GMR',
    fromName: 'Gambir',
    cityFrom: 'Jakarta',
    to: 'SGU',
    toName: 'Surabaya Gubeng',
    duration: '8 Jam 15 Menit',
    price: 'Mulai Rp 350.000',
    tag: 'Lintas Pantura',
    enTag: 'North Coast',
  },
  {
    from: 'BD',
    fromName: 'Bandung',
    cityFrom: 'Bandung',
    to: 'SGU',
    toName: 'Surabaya Gubeng',
    duration: '11 Jam',
    price: 'Mulai Rp 300.000',
    originalPrice: 'Rp 375.000',
    tag: 'Lintas Selatan',
    enTag: 'Southern Line',
  },
  {
    from: 'YK',
    fromName: 'Yogyakarta',
    cityFrom: 'Yogyakarta',
    to: 'GMR',
    toName: 'Gambir',
    duration: '7 Jam',
    price: 'Mulai Rp 250.000',
    tag: 'Bisnis & Wisata',
    enTag: 'Business & Leisure',
  },
  {
    from: 'SLO',
    fromName: 'Solo Balapan',
    cityFrom: 'Solo',
    to: 'BD',
    toName: 'Bandung',
    duration: '8 Jam 45 Menit',
    price: 'Mulai Rp 195.000',
    originalPrice: 'Rp 240.000',
    tag: 'Antar Budaya',
    enTag: 'Cross-Cultural',
  },
]

function TicketCard({ route, onClick, lang }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(route)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(route)
        }
      }}
      className="rh-fun-ticket-card"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#ffffff',
        borderRadius: 14,
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.06)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        minWidth: 290,
        maxWidth: 340,
        flex: '0 0 auto',
        padding: '1.15rem 1.25rem 1.05rem',
      }}
    >
      {/* TOP ROW: Tag & Duration (Craft-floor & UI/UX Pro Max: No undersized text) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.9rem',
        }}
      >
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: '#1a428a',
            background: '#eff6ff',
            padding: '0.3rem 0.65rem',
            borderRadius: 6,
          }}
        >
          {lang === 'en' ? route.enTag : route.tag}
        </span>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#64748b',
          }}
        >
          <Clock size={14} strokeWidth={2.2} />
          {lang === 'en' ? route.duration.replace('Jam', 'h').replace('Menit', 'm') : route.duration}
        </span>
      </div>

      {/* MIDDLE ROW: Station Codes & Direction */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        {/* Origin */}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {route.from}
          </div>
          <div
            style={{
              fontSize: '0.8125rem',
              color: '#64748b',
              fontWeight: 500,
              marginTop: 2,
            }}
          >
            {route.fromName}
          </div>
        </div>

        {/* Minimalist Arrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 0.75rem',
            color: '#94a3b8',
          }}
        >
          <ArrowRight size={18} strokeWidth={2} />
        </div>

        {/* Destination */}
        <div style={{ minWidth: 0, textAlign: 'right' }}>
          <div
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {route.to}
          </div>
          <div
            style={{
              fontSize: '0.8125rem',
              color: '#64748b',
              fontWeight: 500,
              marginTop: 2,
            }}
          >
            {route.toName}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Clean Divider, Price & Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '0.85rem',
          marginTop: '0.25rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            {lang === 'en' ? 'Starting From' : 'Mulai Dari'}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
            {route.originalPrice && (
              <span
                style={{
                  fontSize: '0.8125rem',
                  color: '#94a3b8',
                  textDecoration: 'line-through',
                  fontWeight: 600,
                }}
              >
                {route.originalPrice}
              </span>
            )}
            <span
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: route.originalPrice ? '#ea580c' : '#0f172a',
                letterSpacing: '-0.01em',
              }}
            >
              {route.price.replace('Mulai ', '')}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '0.45rem 0.95rem',
            borderRadius: 8,
            background: '#1a428a',
            color: '#ffffff',
            fontSize: '0.85rem',
            fontWeight: 700,
            transition: 'background 0.15s ease',
          }}
        >
          {lang === 'en' ? 'Select' : 'Pilih'}
          <ChevronRight size={14} strokeWidth={2.8} />
        </div>
      </div>
    </div>
  )
}

export default function PopularTicketRoutes() {
  const { lang } = useLang()
  const router = useRouter()
  const [isPaused, setIsPaused] = useState(false)

  function handleOpenRoute(route) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const date = [
      tomorrow.getFullYear(),
      String(tomorrow.getMonth() + 1).padStart(2, '0'),
      String(tomorrow.getDate()).padStart(2, '0'),
    ].join('-')

    router.push(`/trains?from=${route.from}&to=${route.to}&date=${date}&pax=1`)
  }

  // Duplicate the array for seamless infinite sliding on mobile
  const duplicatedRoutes = [...POPULAR_ROUTES, ...POPULAR_ROUTES]

  return (
    <section
      className="rh-section rh-ticket-section"
      style={{
        background: 'var(--rh-surface, #f8fafc)',
        paddingTop: '2.5rem',
        paddingBottom: '2.5rem',
        position: 'relative',
      }}
    >
      <div className="rh-container">
        {/* Section Header: Craft-Floor - No banned kicker/eyebrow */}
        <div
          style={{
            marginBottom: '1.35rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <h2
              className="rh-h3"
              style={{
                margin: 0,
                color: '#0f172a',
                fontSize: 'clamp(1.3rem, 2.4vw, 1.6rem)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
              }}
            >
              {lang === 'en' ? 'Favorite Train Journeys' : 'Pilihan Tiket Kereta Favorit'}
            </h2>
          </div>

          <span
            className="rh-show-mobile-only"
            style={{
              fontSize: '0.72rem',
              color: '#64748b',
              fontWeight: 500,
            }}
          >
            {lang === 'en' ? 'Sliding right • Tap to choose' : 'Sliding ke kanan • Sentuh untuk memilih'}
          </span>
        </div>
      </div>

      {/* MOBILE INFINITE CONTINUOUS RIGHT-SLIDING TRACK */}
      <div
        className="rh-ticket-mobile-container rh-show-mobile-only"
        style={{
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
          padding: '0.35rem 0',
        }}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Edge Gradient Fades */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: 24,
            background: 'linear-gradient(90deg, var(--rh-surface, #f8fafc) 0%, transparent 100%)',
            zIndex: 4,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: 24,
            background: 'linear-gradient(270deg, var(--rh-surface, #f8fafc) 0%, transparent 100%)',
            zIndex: 4,
            pointerEvents: 'none',
          }}
        />

        {/* Continuous sliding track */}
        <div
          className="rh-ticket-slide-track"
          style={{
            display: 'flex',
            gap: '0.85rem',
            width: 'max-content',
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {duplicatedRoutes.map((route, idx) => (
            <TicketCard
              key={`mob-${route.from}-${route.to}-${idx}`}
              route={route}
              onClick={handleOpenRoute}
              lang={lang}
            />
          ))}
        </div>
      </div>

      {/* DESKTOP RESPONSIVE GRID (Min-width: 769px) */}
      <div className="rh-container rh-hide-mobile">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            gap: '1rem',
          }}
        >
          {POPULAR_ROUTES.map((route, idx) => (
            <TicketCard
              key={`desk-${route.from}-${route.to}-${idx}`}
              route={route}
              onClick={handleOpenRoute}
              lang={lang}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
