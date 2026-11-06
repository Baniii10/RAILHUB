'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import SearchWidget from '@/components/booking/SearchWidget'
import MobilePortalHeader from '@/components/home/MobilePortalHeader'
import FeaturedServicesSlider from '@/components/home/FeaturedServicesSlider'
import TrainBumperBanner from '@/components/home/TrainBumperBanner'
import HomeHeroScenery from '@/components/home/HomeHeroScenery'
import PromoBannerCarousel from '@/components/home/PromoBannerCarousel'
import PopularTicketRoutes from '@/components/home/PopularTicketRoutes'
import TravelClassShowcase from '@/components/home/TravelClassShowcase'
import PwaGalleryBento from '@/components/home/PwaGalleryBento'
import { useLang } from '@/contexts/LangContext'
import { useAuth } from '@/contexts/AuthContext'
import { ChevronRight } from 'lucide-react'

export default function HomePage() {
  const { t, lang } = useLang()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [isDay, setIsDay] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const checkTime = () => {
      const hr = new Date().getHours()
      setIsDay(hr >= 6 && hr < 18)
    }

    checkTime()
    const interval = setInterval(checkTime, 60000)
    return () => clearInterval(interval)
  }, [])

  // On SSR and initial hydration, render for public/guest view.
  // After client mount, if an authenticated user session is detected, hide these guest sections.
  const isGuest = !mounted || !user

  return (
    <div>
      <Navbar />

      {/* Animated train bumper */}
      <TrainBumperBanner />

      {/* Hero and search (Siang / Malam Vector Background) */}
      <section
        className={`rh-hero ${isDay ? 'rh-hero-day' : 'rh-hero-night'}`}
        style={{
          paddingBottom: '2.5rem',
          background: isDay
            ? 'linear-gradient(180deg, #0284c7 0%, #0ea5e9 35%, #38bdf8 65%, #7dd3fc 100%)'
            : 'linear-gradient(180deg, #050d1a 0%, #0a1f3d 35%, #0f2c59 70%, #07162c 100%)',
          transition: 'background 0.5s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Sun, Clouds & 5% Transparent Nature Scenery */}
        <HomeHeroScenery isDay={isDay} />

        <div className="rh-pattern-dots" style={{ position: 'absolute', inset: 0, opacity: isDay ? 0.12 : 0.25, pointerEvents: 'none' }} />

        <div className="rh-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(1.5rem, 3.5vw, 3rem)', alignItems: 'center' }}>
            {/* Desktop Headline */}
            <div className="animate-fade-in rh-hide-mobile">
              <h1 className="rh-h1" style={{ color: 'white', marginBottom: '1rem', maxWidth: 500, lineHeight: 1.18, textShadow: isDay ? '0 2px 10px rgba(2, 132, 199, 0.4)' : '0 2px 12px rgba(0, 0, 0, 0.5)' }}>
                {t.hero.title}
              </h1>

              <p className="rh-body-lg" style={{ color: 'rgba(255,255,255,0.92)', margin: 0, maxWidth: 440, lineHeight: 1.6, textShadow: isDay ? '0 1px 6px rgba(2, 132, 199, 0.3)' : '0 1px 8px rgba(0, 0, 0, 0.5)' }}>
                {t.hero.subtitle}
              </p>
            </div>

            {/* Elevated Search Widget Card - SHAPE BIASA (Solid White Card, NO Glassmorphism) */}
            <div className="animate-slide-right">
              <div
                className="rh-search-card"
                style={{
                  background: isDay ? 'rgba(255, 255, 255, 0.78)' : 'rgba(10, 25, 48, 0.76)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  borderRadius: 24,
                  boxShadow: isDay
                    ? '0 24px 60px -12px rgba(2, 44, 102, 0.25), 0 10px 30px -8px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.85)'
                    : '0 24px 60px -12px rgba(0, 0, 0, 0.5), 0 10px 30px -8px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                  border: isDay ? '1.5px solid rgba(255, 255, 255, 0.8)' : '1.5px solid rgba(255, 255, 255, 0.18)',
                  overflow: 'hidden',
                }}
              >
                <SearchWidget />
              </div>
            </div>
          </div>

          <div className="rh-show-mobile-only" style={{ marginTop: '1rem' }}>
            <MobilePortalHeader />
          </div>
        </div>
      </section>

      {/* Featured services */}
      <FeaturedServicesSlider />

      <section id="promos" className="rh-section" style={{ background: '#ffffff', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="rh-container">
          <h2 className="rh-h3" style={{ margin: '0 0 1rem', color: 'var(--rh-navy)', fontSize: '1.35rem', fontWeight: 800 }}>
            {lang === 'en' ? 'Travel Deals' : 'Promo Perjalanan Kereta'}
          </h2>
          <PromoBannerCarousel />
        </div>
      </section>

      {/* Popular routes - Fun Ticket Shape & Continuous Mobile Sliding */}
      <PopularTicketRoutes />

      {/* Guest-Only Sections: Class Showcase with Photos & Bento Gallery with PWA App Download */}
      {isGuest && (
        <>
          <TravelClassShowcase />
          <PwaGalleryBento />
        </>
      )}

      {/* Compact closing section */}
      <section className="home-bottom-cta" style={{ background: 'var(--rh-primary)', padding: '2.5rem 0 calc(5.5rem + env(safe-area-inset-bottom, 0px))', color: 'white' }}>
        <div className="rh-container" style={{ textAlign: 'center', maxWidth: 580 }}>
          <h2 className="rh-h3" style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.35rem' }}>
            {lang === 'en' ? 'Ready for Your Next Journey?' : 'Siap Memulai Perjalanan Anda?'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
            {lang === 'en' ? 'Book tickets, keep your QR boarding pass, and view journey status in one place.' : 'Pesan tiket, simpan e-boarding pass QR, dan pantau status perjalanan dari satu tempat.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/trains" className="rh-btn rh-btn-accent rh-btn-sm" style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}>
              {lang === 'en' ? 'Find Tickets' : 'Cari Tiket Sekarang'} <ChevronRight size={16} />
            </Link>
            <Link
              href="/about"
              className="rh-btn rh-btn-sm"
              style={{
                background: 'rgba(255,255,255,0.12)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.25)',
                padding: '0.55rem 1.25rem',
                fontSize: '0.85rem',
              }}
            >
              {lang === 'en' ? 'About & Privacy' : 'Tentang & Privasi'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
