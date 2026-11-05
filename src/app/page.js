'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import SearchWidget from '@/components/booking/SearchWidget'
import MobilePortalHeader from '@/components/home/MobilePortalHeader'
import FeaturedServicesSlider from '@/components/home/FeaturedServicesSlider'
import TrainBumperBanner from '@/components/home/TrainBumperBanner'
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
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  // On SSR and initial hydration, render for public/guest view.
  // After client mount, if an authenticated user session is detected, hide these guest sections.
  const isGuest = !mounted || !user

  return (
    <div>
      <Navbar />

      {/* Animated train bumper */}
      <TrainBumperBanner />

      {/* Hero and search */}
      <section className="rh-hero" style={{ paddingBottom: '2.5rem' }}>
        <div className="rh-pattern-dots" style={{ position: 'absolute', inset: 0, opacity: 0.35 }} />

        <div className="rh-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(1.5rem, 3.5vw, 3rem)', alignItems: 'center' }}>
            {/* Desktop Headline */}
            <div className="animate-fade-in rh-hide-mobile">
              <h1 className="rh-h1" style={{ color: 'white', marginBottom: '1rem', maxWidth: 500, lineHeight: 1.18 }}>
                {t.hero.title}
              </h1>

              <p className="rh-body-lg" style={{ color: 'rgba(255,255,255,0.85)', margin: 0, maxWidth: 440, lineHeight: 1.6 }}>
                {t.hero.subtitle}
              </p>
            </div>

            {/* Elevated Search Widget Card */}
            <div className="animate-slide-right">
              <div className="rh-search-card" style={{ boxShadow: '0 12px 36px rgba(0,0,0,0.18)' }}>
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
