'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles, Ticket, UtensilsCrossed } from 'lucide-react'

const PROMO_SLIDES = [
  {
    id: 'promo-food',
    badge: 'ON-BOARD',
    title: 'Diskon 20% Restorasi',
    subtitle: 'Kopi & makanan hangat diantar ke kursi',
    cta: 'Pesan',
    action: 'services',
    gradient: 'linear-gradient(120deg, #0f295c 0%, #1d4ed8 60%, #3b82f6 100%)',
    accent: '#fbbf24',
    Icon: UtensilsCrossed,
  },
  {
    id: 'promo-pp',
    badge: 'HEMAT PP',
    title: 'Potongan 25% Tiket Pulang',
    subtitle: 'Pesan perjalanan pulang-pergi lebih hemat',
    cta: 'Cari Tiket',
    href: '/trains',
    gradient: 'linear-gradient(120deg, #9a3412 0%, #ea580c 58%, #f97316 100%)',
    accent: '#fef08a',
    Icon: Ticket,
  },
  {
    id: 'promo-upgrade',
    badge: 'EKSEKUTIF',
    title: 'Kabin Lega & WiFi Cepat',
    subtitle: 'Kursi reclining 180° rute favorit Jawa',
    cta: 'Lihat Kelas',
    href: '/trains',
    gradient: 'linear-gradient(120deg, #064e3b 0%, #059669 60%, #10b981 100%)',
    accent: '#fde68a',
    Icon: Sparkles,
  },
]

// Cloned ends for seamless infinite looping: [last, 0, 1, 2, first]
const EXTENDED_SLIDES = [
  { ...PROMO_SLIDES[PROMO_SLIDES.length - 1], key: 'clone-last', realIdx: PROMO_SLIDES.length - 1 },
  ...PROMO_SLIDES.map((s, idx) => ({ ...s, key: s.id, realIdx: idx })),
  { ...PROMO_SLIDES[0], key: 'clone-first', realIdx: 0 },
]

export default function JourneyPromoBanner({ onSelectTab }) {
  const router = useRouter()
  const [trackIdx, setTrackIdx] = useState(1)
  const [animate, setAnimate] = useState(true)
  const [paused, setPaused] = useState(false)
  const [dragPx, setDragPx] = useState(0)
  const touchStartX = useRef(null)
  const didSwipe = useRef(false)

  // Auto-slide every 2 seconds
  useEffect(() => {
    if (paused) return undefined
    const timer = setInterval(() => {
      setAnimate(true)
      setTrackIdx((prev) => (prev >= EXTENDED_SLIDES.length - 1 ? 1 : prev + 1))
    }, 2000)
    return () => clearInterval(timer)
  }, [paused])

  function handleTransitionEnd() {
    if (trackIdx === EXTENDED_SLIDES.length - 1) {
      setAnimate(false)
      setTrackIdx(1)
    } else if (trackIdx === 0) {
      setAnimate(false)
      setTrackIdx(PROMO_SLIDES.length)
    }
  }

  function handleTouchStart(e) {
    setPaused(true)
    setAnimate(false)
    touchStartX.current = e.touches[0].clientX
    didSwipe.current = false
  }

  function handleTouchMove(e) {
    if (touchStartX.current === null) return
    const delta = e.touches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 8) didSwipe.current = true
    setDragPx(delta)
  }

  function handleTouchEnd() {
    if (touchStartX.current === null) return
    setAnimate(true)
    if (dragPx < -40) {
      setTrackIdx((prev) => Math.min(EXTENDED_SLIDES.length - 1, prev + 1))
    } else if (dragPx > 40) {
      setTrackIdx((prev) => Math.max(0, prev - 1))
    }
    setDragPx(0)
    touchStartX.current = null
    setPaused(false)
  }

  function handleSlideClick(slide) {
    if (didSwipe.current) return
    if (slide.action) {
      onSelectTab?.(slide.action)
    } else if (slide.href) {
      router.push(slide.href)
    }
  }

  const activeRealIdx = EXTENDED_SLIDES[trackIdx]?.realIdx ?? 0

  return (
    <div
      className="rh-journey-promo-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Promo perjalanan"
    >
      <div className="rh-journey-promo-viewport">
        <div
          className="rh-journey-promo-track"
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translateX(calc(${-trackIdx * 100}% + ${dragPx}px))`,
            transition: animate ? 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
          }}
        >
          {EXTENDED_SLIDES.map((slide, idx) => {
            const isActive = idx === trackIdx
            const Icon = slide.Icon
            return (
              <div
                key={slide.key}
                className={`rh-journey-promo-slide ${isActive ? 'is-active' : 'is-peek'}`}
              >
                <button
                  type="button"
                  onClick={() => handleSlideClick(slide)}
                  className="rh-journey-promo-card"
                  style={{ background: slide.gradient }}
                >
                  <div className="rh-journey-promo-left">
                    <span className="rh-journey-promo-badge" style={{ color: slide.accent }}>
                      <Icon size={13} /> {slide.badge}
                    </span>
                    <strong className="rh-journey-promo-title">{slide.title}</strong>
                    <span className="rh-journey-promo-sub">{slide.subtitle}</span>
                  </div>

                  <span className="rh-journey-promo-cta">
                    {slide.cta} <ArrowRight size={14} />
                  </span>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Minimalist Dots */}
      <div className="rh-journey-promo-dots" aria-label="Pilih slide promo">
        {PROMO_SLIDES.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            aria-label={s.title}
            aria-current={activeRealIdx === idx ? 'true' : undefined}
            onClick={() => {
              setAnimate(true)
              setTrackIdx(idx + 1)
            }}
          >
            <span />
          </button>
        ))}
      </div>
    </div>
  )
}
