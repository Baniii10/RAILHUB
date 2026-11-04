'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { Radio, QrCode, UtensilsCrossed, Armchair, CreditCard, ChevronRight, ChevronLeft, Sparkles, ArrowRight } from 'lucide-react'
import { useLang } from '@/contexts/LangContext'

const FEATURES = [
  {
    id: 'live-tracking',
    titleId: 'Live Tracking Kereta',
    titleEn: 'Live Train Tracking',
    badgeId: 'GPS Real-Time',
    badgeEn: 'Real-Time GPS',
    descId: 'Pantau posisi nyata kereta, kecepatan laju, stasiun terdekat, dan estimasi waktu tiba langsung di layar HP Anda.',
    descEn: 'Track live train position, current speed, upcoming stations, and estimated arrival in real-time.',
    icon: Radio,
    color: '#2563eb',
    bgLight: 'rgba(37, 99, 235, 0.08)',
    href: '/trains',
    actionId: 'Cek Jadwal & Rute',
    actionEn: 'Check Schedule',
  },
  {
    id: 'e-boarding',
    titleId: 'E-Boarding Pass Digital',
    titleEn: 'Digital E-Boarding Pass',
    badgeId: 'Tanpa Antre Fisik',
    badgeEn: 'Paperless Gate',
    descId: 'Boarding gate stasiun langsung dari smartphone tanpa repot cetak tiket fisik atau antre di loket cetak stasiun.',
    descEn: 'Direct boarding from your phone without physical printing or waiting in station print queues.',
    icon: QrCode,
    color: '#059669',
    bgLight: 'rgba(5, 150, 105, 0.08)',
    href: '/dashboard/passenger',
    actionId: 'Lihat Boarding Pass',
    actionEn: 'View Boarding Pass',
  },
  {
    id: 'onboard-dining',
    titleId: 'Kuliner Restorasi Kereta',
    titleEn: 'Onboard Dining Service',
    badgeId: 'Diantar ke Kursi',
    badgeEn: 'Delivered to Seat',
    descId: 'Pesan kuliner khas kereta api online, pramusaji restorasi siap mengantarkan hidangan hangat langsung ke nomor kursi Anda.',
    descEn: 'Order authentic Indonesian train culinary online, delivered right to your seat by onboard attendants.',
    icon: UtensilsCrossed,
    color: '#ea580c',
    bgLight: 'rgba(234, 88, 12, 0.08)',
    href: '/dashboard/orders',
    actionId: 'Pesan Kuliner',
    actionEn: 'Order Meals',
  },
  {
    id: 'seat-selection',
    titleId: 'Pilihan Kursi & Gerbong',
    titleEn: 'Interactive Seat Selection',
    badgeId: 'Bebas Pilih Posisi',
    badgeEn: 'Pick Your Spot',
    descId: 'Denah gerbong interaktif visual nyata. Bebas tentukan kursi dekat jendela lanskap, lorong, atau area rombongan keluarga.',
    descEn: 'Interactive visual carriage layout. Choose window seats for panoramic views, aisles, or family clusters.',
    icon: Armchair,
    color: '#7c3aed',
    bgLight: 'rgba(124, 58, 237, 0.08)',
    href: '/trains',
    actionId: 'Pilih Kursi Favorit',
    actionEn: 'Choose Seats',
  },
  {
    id: 'multi-payment',
    titleId: 'Multi-Payment Instan QRIS',
    titleEn: 'Instant QRIS & VA Payment',
    badgeId: 'Konfirmasi Kilat',
    badgeEn: 'Instant Verify',
    descId: 'Transaksi terkonfirmasi otomatis dalam hitungan detik via QRIS, GoPay, OVO, ShopeePay, serta Virtual Account bank utama.',
    descEn: 'Automated instant payment verification within seconds via QRIS, e-wallets, and major bank virtual accounts.',
    icon: CreditCard,
    color: '#0891b2',
    bgLight: 'rgba(8, 145, 178, 0.08)',
    href: '/trains',
    actionId: 'Mulai Pemesanan',
    actionEn: 'Start Booking',
  },
]

export default function FeaturedServicesSlider() {
  const { lang } = useLang()
  const sliderRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // Track active card on scroll
  function handleScroll() {
    if (!sliderRef.current) return
    const container = sliderRef.current
    const scrollLeft = container.scrollLeft
    const cardWidth = container.querySelector('.rh-feature-slide-card')?.offsetWidth || 280
    const newIdx = Math.round(scrollLeft / (cardWidth + 14))
    setActiveIndex(Math.min(Math.max(newIdx, 0), FEATURES.length - 1))
  }

  function scrollToIndex(idx) {
    if (!sliderRef.current) return
    const container = sliderRef.current
    const cardWidth = container.querySelector('.rh-feature-slide-card')?.offsetWidth || 280
    container.scrollTo({
      left: idx * (cardWidth + 14),
      behavior: 'smooth',
    })
    setActiveIndex(idx)
  }

  function handlePrev() {
    scrollToIndex(Math.max(activeIndex - 1, 0))
  }

  function handleNext() {
    scrollToIndex(Math.min(activeIndex + 1, FEATURES.length - 1))
  }

  return (
    <section className="rh-section rh-featured-services-section" style={{ background: '#f8fafc', paddingTop: '2.25rem', paddingBottom: '2.5rem' }}>
      <div className="rh-container">
        {/* Header with Title & Slider Controls */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div>
            <h2 className="rh-h3" style={{ margin: 0, color: 'var(--rh-navy)', fontSize: 'clamp(1.2rem, 2.5vw, 1.45rem)', fontWeight: 800 }}>
              {lang === 'en' ? 'Core Railway Services' : 'Layanan Utama RAILHUB'}
            </h2>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.875rem' }}>
              {lang === 'en' ? 'Smart digital travel ecosystem across Java' : 'Kemudahan pemesanan dan pemantauan perjalanan se-Pulau Jawa'}
            </p>
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="rh-hide-mobile" style={{ fontSize: '0.8rem', color: 'var(--rh-text-3)', fontWeight: 600 }}>
              {activeIndex + 1} / {FEATURES.length}
            </span>
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeIndex === 0}
              aria-label="Fitur sebelumnya"
              className="rh-btn rh-btn-ghost rh-btn-sm"
              style={{
                borderRadius: '50%',
                width: 36,
                height: 36,
                padding: 0,
                display: 'grid',
                placeItems: 'center',
                background: '#ffffff',
                border: '1px solid var(--rh-border)',
                opacity: activeIndex === 0 ? 0.4 : 1,
                cursor: activeIndex === 0 ? 'default' : 'pointer',
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={activeIndex === FEATURES.length - 1}
              aria-label="Fitur berikutnya"
              className="rh-btn rh-btn-ghost rh-btn-sm"
              style={{
                borderRadius: '50%',
                width: 36,
                height: 36,
                padding: 0,
                display: 'grid',
                placeItems: 'center',
                background: '#ffffff',
                border: '1px solid var(--rh-border)',
                opacity: activeIndex === FEATURES.length - 1 ? 0.4 : 1,
                cursor: activeIndex === FEATURES.length - 1 ? 'default' : 'pointer',
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Sliding Track (Mobile-First CSS Scroll Snap) */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="rh-featured-slider-track"
          style={{
            display: 'flex',
            gap: '0.875rem',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: '0.75rem',
            paddingTop: '0.25rem',
            paddingLeft: '0.1rem',
            paddingRight: '0.1rem',
            scrollbarWidth: 'none',
          }}
        >
          {FEATURES.map((item, index) => {
            const Icon = item.icon
            const isCurrent = activeIndex === index
            return (
              <div
                key={item.id}
                className="rh-feature-slide-card"
                style={{
                  flex: '0 0 clamp(270px, 78vw, 310px)',
                  scrollSnapAlign: 'start',
                  background: '#ffffff',
                  borderRadius: 18,
                  padding: '1.25rem',
                  border: isCurrent ? `1.5px solid ${item.color}` : '1.5px solid var(--rh-border)',
                  boxShadow: isCurrent
                    ? `0 10px 25px -5px ${item.color}25, 0 4px 10px rgba(0,0,0,0.04)`
                    : '0 4px 12px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease',
                  cursor: 'pointer',
                }}
              >
                {/* Content */}
                <div>
                  {/* Badge & Icon Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: item.bgLight,
                        color: item.color,
                        display: 'grid',
                        placeItems: 'center',
                        transition: 'transform 0.25s ease',
                      }}
                    >
                      <Icon size={22} strokeWidth={2.2} />
                    </div>

                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 999,
                        background: item.bgLight,
                        color: item.color,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {lang === 'en' ? item.badgeEn : item.badgeId}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: 'var(--rh-navy)',
                      marginBottom: '0.45rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {lang === 'en' ? item.titleEn : item.titleId}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: '0.84rem',
                      color: 'var(--rh-text-2)',
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {lang === 'en' ? item.descEn : item.descId}
                  </p>
                </div>

                {/* Bottom Action Link */}
                <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                  <Link
                    href={item.href}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: item.color,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <span>{lang === 'en' ? item.actionEn : item.actionId}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Mobile Dots Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', marginTop: '0.85rem' }}>
          {FEATURES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Slide ke-${idx + 1}`}
              onClick={() => scrollToIndex(idx)}
              style={{
                width: activeIndex === idx ? 22 : 6,
                height: 6,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                background: activeIndex === idx ? 'var(--rh-primary)' : '#cbd5e1',
                transition: 'all 0.25s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

