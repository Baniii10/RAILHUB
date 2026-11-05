'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import SearchWidget from '@/components/booking/SearchWidget'
import MobilePortalHeader from '@/components/home/MobilePortalHeader'
import FeaturedServicesSlider from '@/components/home/FeaturedServicesSlider'
import TrainBumperBanner from '@/components/home/TrainBumperBanner'
import PromoBannerCarousel from '@/components/home/PromoBannerCarousel'
import PopularTicketRoutes from '@/components/home/PopularTicketRoutes'
import { useLang } from '@/contexts/LangContext'
import {
  ChevronRight,  Train,
  Sparkles,  Armchair,
  Clock,
} from 'lucide-react'


const FLEET_CLASSES = [
  {
    title: 'Luxury Sleeper',
    badge: 'Kenyamanan Tertinggi',
    summary: 'Kursi rebah 140° · Layar VOD Pribadi · Bistro Hangat Gratis',
    summaryEn: '140° reclining seat · Personal VOD screen · Warm meal',
    icon: Armchair,
    price: 'Mulai Rp 450.000',
  },
  {
    title: 'Eksekutif',
    badge: 'Paling Populer',
    summary: 'Captain Seat 2-2 Putar · Meja Kerja Lipat · WiFi Kabin',
    summaryEn: '2-2 reclining seat · Folding table · Cabin WiFi',
    icon: Train,
    price: 'Mulai Rp 250.000',
  },
  {
    title: 'Ekonomi New Gen',
    badge: 'Terjangkau & Modern',
    summary: 'Kursi 2-2 Reclining · AC Dingin · Kabin Bebas Bising',
    summaryEn: '2-2 reclining seat · Air-conditioned cabin',
    icon: Sparkles,
    price: 'Mulai Rp 120.000',
  },
]

export default function HomePage() {
  const { t, lang } = useLang()
  const router = useRouter()



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

      {/* Fleet and cabin comfort */}
      <section className="rh-section home-fleet-section" style={{ background: '#ffffff', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="rh-container">
          <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
            <h2 className="rh-h3" style={{ margin: 0, color: 'var(--rh-navy)', fontSize: '1.35rem', fontWeight: 800 }}>{lang === 'en' ? 'Choose Your Travel Class' : 'Pilihan Kelas Kereta'}</h2>
          </div>

          {/* Ultra-compact 3-card horizontal grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '0.75rem' }}>
            {FLEET_CLASSES.map(fc => {
              const Icon = fc.icon
              return (
                <Link
                  key={fc.title}
                  href="/trains"
                  className="rh-card rh-card-interactive"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    textDecoration: 'none',
                    background: '#ffffff',
                    border: '1px solid var(--rh-border)',
                    borderRadius: 14,
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--rh-primary-light)', color: 'var(--rh-primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon size={20} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--rh-navy)' }}>{fc.title}</strong>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--rh-accent-dark)' }}>{lang === 'en' ? fc.price.replace('Mulai', 'From') : fc.price}</span>
                    </div>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--rh-text-2)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {lang === 'en' ? fc.summaryEn : fc.summary}
                    </span>
                  </div>
                  <ChevronRight size={15} style={{ color: 'var(--rh-text-3)', flexShrink: 0 }} />
                </Link>
              )
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <Link href="/about" style={{ fontSize: '0.8rem', color: 'var(--rh-primary)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              {lang === 'en' ? 'See All Classes & About the Team' : 'Lihat Seluruh Armada & Portofolio Tim'} <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

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
