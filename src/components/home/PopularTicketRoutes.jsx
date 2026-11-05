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
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 14px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        minWidth: 290,
        maxWidth: 340,
        flex: '0 0 auto',
        padding: '1.15rem 1.25rem 1rem',
      }}
    >
      {/* Semicircular Ticket Punch Notches on Left & Right */}
      <div
        style={{
          position: 'absolute',
          left: -8,
          bottom: 44,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: 'var(--rh-surface, #f8fafc)',
          borderRight: '1px solid #cbd5e1',
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -8,
          bottom: 44,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: 'var(--rh-surface, #f8fafc)',
          borderLeft: '1px solid #cbd5e1',
          zIndex: 2,
        }}
      />

      {/* TOP ROW: Minimalist Tag & Duration */}
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
            fontSize: '0.68rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: '#1a428a',
            background: '#eff6ff',
            padding: '0.2rem 0.55rem',
            borderRadius: 6,
          }}
        >
          {lang === 'en' ? route.enTag : route.tag}
        </span>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '0.72rem',
            fontWeight: 600,
            color: '#64748b',
          }}
        >
          <Clock size={12} strokeWidth={2.2} />
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
              fontSize: '1.35rem',
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
              fontSize: '0.75rem',
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
              fontSize: '1.35rem',
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
              fontSize: '0.75rem',
              color: '#64748b',
              fontWeight: 500,
              marginTop: 2,
            }}
          >
            {route.toName}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Perforated Divider, Price & Simple Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px dashed #cbd5e1',
          paddingTop: '0.75rem',
          marginTop: '0.25rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            {lang === 'en' ? 'Starting From' : 'Mulai Dari'}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
            {route.originalPrice && (
              <span
                style={{
                  fontSize: '0.74rem',
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
                fontSize: '0.98rem',
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
            gap: 3,
            padding: '0.4rem 0.85rem',
            borderRadius: 8,
            background: '#1a428a',
            color: '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 700,
            transition: 'background 0.15s ease',
          }}
        >
          {lang === 'en' ? 'Select' : 'Pilih'}
          <ChevronRight size={13} strokeWidth={2.8} />
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
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div className="rh-container">
        {/* Section Header */}
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
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#1a428a',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: '0.2rem',
              }}
            >
              {lang === 'en' ? 'Popular Routes' : 'Rute Terfavorit'}
            </span>
            <h2
              className="rh-h3"
              style={{
                margin: 0,
                color: '#0f172a',
                fontSize: 'clamp(1.2rem, 2.2vw, 1.45rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
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
