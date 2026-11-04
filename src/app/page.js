'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import SearchWidget from '@/components/booking/SearchWidget'
import MobilePortalHeader from '@/components/home/MobilePortalHeader'
import FeaturedServicesSlider from '@/components/home/FeaturedServicesSlider'
import TrainBumperBanner from '@/components/home/TrainBumperBanner'
import { useLang } from '@/contexts/LangContext'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import {
  ChevronRight,
  ChevronLeft,
  MapPin,
  Train,
  Sparkles,
  Copy,
  Armchair,
  Clock,
  Compass,
  CheckCircle2,
} from 'lucide-react'

const PROMO_BANNERS = [
  {
    id: 'promo-1',
    badge: 'PROMO EKSKLUSIF · PRAMUGARI RAILHUB',
    headline: 'DISKON 25% TIKET EKSEKUTIF SE-PULAU JAWA',
    subtext: 'Nikmati kursi rebah ergonomis, bistro restorasi hangat, dan pelayanan kru terbaik sepanjang lintasan.',
    code: 'JELAJAHJAWA25',
    attendantName: 'Kru Layanan Eksekutif',
    attendantRole: 'Siap Melayani di Setiap Gerbong',
    gradient: 'linear-gradient(125deg, #1A428A 0%, #4F4F4F 100%)',
    accentColor: '#FF8C00',
  },
  {
    id: 'promo-2',
    badge: 'EARLY BIRD · PEMESANAN JAUH HARI',
    headline: 'HEMAT RP 75.000 RUTE JAKARTA — YOGYAKARTA & SURABAYA',
    subtext: 'Pesan lebih awal untuk keberangkatan kereta unggulan Taksaka & Argo Bromo dengan pilihan kursi bebas.',
    code: 'RAILHUBHEMAT75',
    attendantName: 'Pramugari Restorasi Onboard',
    attendantRole: 'Kuliner Hangat Diantar ke Kursi',
    gradient: 'linear-gradient(125deg, #A83232 0%, #4F4F4F 100%)',
    accentColor: '#FFA834',
  },
  {
    id: 'promo-3',
    badge: 'PAKET KELUARGA & ROMBONGAN',
    headline: 'PESAN HINGGA 6 PENUMPANG DALAM SATU BOOKING',
    subtext: 'Duduk berdampingan satu keluarga dalam satu kode booking, lengkap dengan e-boarding pass QR instan.',
    code: 'KELUARGARAIL',
    attendantName: 'Petugas Hospitality Stasiun',
    attendantRole: 'Pendampingan Peron & Boarding',
    gradient: 'linear-gradient(125deg, #4F4F4F 0%, #A83232 100%)',
    accentColor: '#FF8C00',
  },
]

const PROMO_BANNERS_EN = [
  { badge: 'EXCLUSIVE OFFER · RAILHUB CREW', headline: '25% OFF EXECUTIVE TICKETS ACROSS JAVA', subtext: 'Enjoy reclining seats, warm bistro meals, and attentive onboard service.', attendantName: 'Executive Service Crew' },
  { badge: 'EARLY BIRD · ADVANCE BOOKING', headline: 'SAVE RP 75,000 ON JAKARTA, YOGYAKARTA & SURABAYA ROUTES', subtext: 'Book selected departures early and choose your preferred available seat.', attendantName: 'Onboard Service Crew' },
  { badge: 'FAMILY & GROUP TRAVEL', headline: 'BOOK UP TO 6 PASSENGERS IN ONE RESERVATION', subtext: 'Keep one booking code for the group and receive a digital QR ticket.', attendantName: 'Station Service Crew' },
]

const POPULAR_ROUTES = [
  { from: 'GMR', fromName: 'Gambir (Jakarta)',   to: 'BD',  toName: 'Bandung',         duration: '3j 00m', price: 'Mulai Rp 150.000', tag: 'Favorit Akhir Pekan', enTag: 'Weekend Favorite' },
  { from: 'GMR', fromName: 'Gambir (Jakarta)',   to: 'YK',  toName: 'Yogyakarta',      duration: '7j 00m', price: 'Mulai Rp 250.000', tag: 'Rute Wisata', enTag: 'Leisure Route' },
  { from: 'GMR', fromName: 'Gambir (Jakarta)',   to: 'SGU', toName: 'Surabaya Gubeng', duration: '8j 15m', price: 'Mulai Rp 350.000', tag: 'Lintas Pantura', enTag: 'North Coast' },
  { from: 'BD',  fromName: 'Bandung',            to: 'SGU', toName: 'Surabaya Gubeng', duration: '11j 00m', price: 'Mulai Rp 300.000', tag: 'Lintas Selatan', enTag: 'Southern Line' },
  { from: 'YK',  fromName: 'Yogyakarta',         to: 'GMR', toName: 'Gambir (Jakarta)',duration: '7j 00m', price: 'Mulai Rp 250.000', tag: 'Bisnis & Wisata', enTag: 'Business & Leisure' },
  { from: 'SLO', fromName: 'Solo Balapan',       to: 'BD',  toName: 'Bandung',         duration: '8j 45m', price: 'Mulai Rp 195.000', tag: 'Antar Budaya', enTag: 'Cross-Cultural' },
]

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
  const { user } = useAuth()
  const [promoIndex, setPromoIndex] = useState(0)

  // Auto rotate promo banners every 6 seconds
  useEffect(() => {
    const timer = window.setInterval(() => {
      setPromoIndex(prev => (prev + 1) % PROMO_BANNERS.length)
    }, 6000)
    return () => window.clearInterval(timer)
  }, [])

  function openPopularRoute(event, route) {
    event.preventDefault()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const date = [
      tomorrow.getFullYear(),
      String(tomorrow.getMonth() + 1).padStart(2, '0'),
      String(tomorrow.getDate()).padStart(2, '0'),
    ].join('-')

    router.push(`/trains?from=${route.from}&to=${route.to}&date=${date}&pax=1`)
  }

  function copyPromoCode(code) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code)
    }
    toast.success(lang === 'en' ? `Promo code ${code} copied!` : `Kode promo ${code} berhasil disalin!`)
  }

  const activePromo = lang === 'en'
    ? { ...PROMO_BANNERS[promoIndex], ...PROMO_BANNERS_EN[promoIndex] }
    : PROMO_BANNERS[promoIndex]

  return (
    <div>
      <Navbar />

      {/* ── CINEMATIC TRAIN BUMPER (Strict 8:2 Aspect Ratio, Smooth GPU Animation, Zero Lag) ── */}
      <TrainBumperBanner />

      {/* ── HERO & SEARCH SECTION ──────────────────────────── */}
      <section className="rh-hero" style={{ paddingBottom: '2.5rem' }}>
        <div className="rh-pattern-dots" style={{ position: 'absolute', inset: 0, opacity: 0.35 }} />

        <div className="rh-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(1.5rem, 3.5vw, 3rem)', alignItems: 'center' }}>
            {/* Desktop Headline & Value Highlights */}
            <div className="animate-fade-in rh-hide-mobile">
              <div
                className="rh-badge"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: 'var(--rh-accent)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  marginBottom: '1.25rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <Train size={14} /> {lang === 'en' ? 'Java Railway Platform' : 'Platform Kereta Pulau Jawa'}
              </div>

              <h1 className="rh-h1" style={{ color: 'white', marginBottom: '1rem', maxWidth: 500, lineHeight: 1.18 }}>
                {t.hero.title}
              </h1>

              <p className="rh-body-lg" style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '1.75rem', maxWidth: 440, lineHeight: 1.6 }}>
                {t.hero.subtitle}
              </p>

              {/* Fast stats pills */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.4rem', color: 'var(--rh-accent)', fontWeight: 800 }}>50</strong>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>{lang === 'en' ? 'Stations' : 'Stasiun Aktif'}</span>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.15)' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '1.4rem', color: 'white', fontWeight: 800 }}>100%</strong>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>{lang === 'en' ? 'Seat Availability' : 'Ketersediaan Kursi'}</span>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.15)' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '1.4rem', color: 'var(--rh-accent)', fontWeight: 800 }}>QR Ready</strong>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>E-Boarding Pass</span>
                </div>
              </div>
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

      {/* ── 5 STANDOUT CAPABILITIES SLIDER (Mobile-First) ── */}
      <FeaturedServicesSlider />

      {/* ── 3 SLIDING PROMO BANNERS (Strict 8:3 Ratio) ───── */}
      <section id="promos" className="rh-section" style={{ background: '#ffffff', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="rh-container">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <span className="rh-badge rh-badge-primary" style={{ marginBottom: '0.25rem' }}>
                <Sparkles size={12} /> {lang === 'en' ? 'Limited Offers' : 'Penawaran Terbatas'}
              </span>
              <h2 className="rh-h3" style={{ margin: 0, color: 'var(--rh-navy)', fontSize: '1.25rem' }}>{lang === 'en' ? 'RAILHUB Travel Deals' : 'Promo Perjalanan RAILHUB'}</h2>
            </div>

            {/* Slider controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                type="button"
                className="rh-btn rh-btn-ghost rh-btn-sm"
                aria-label={lang === 'en' ? 'Previous banner' : 'Banner sebelumnya'}
                onClick={() => setPromoIndex(prev => (prev - 1 + PROMO_BANNERS.length) % PROMO_BANNERS.length)}
                style={{ borderRadius: '50%', width: 32, height: 32, padding: 0, display: 'grid', placeItems: 'center' }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--rh-text)' }}>
                {promoIndex + 1} / {PROMO_BANNERS.length}
              </span>
              <button
                type="button"
                className="rh-btn rh-btn-ghost rh-btn-sm"
                aria-label={lang === 'en' ? 'Next banner' : 'Banner berikutnya'}
                onClick={() => setPromoIndex(prev => (prev + 1) % PROMO_BANNERS.length)}
                style={{ borderRadius: '50%', width: 32, height: 32, padding: 0, display: 'grid', placeItems: 'center' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Active Promo Banner (Enforces strict 8:3 ratio) */}
          <div
            className="rh-promo-banner"
            style={{
              background: activePromo.gradient,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background decorative watermark */}
            <div
              style={{
                position: 'absolute',
                right: -25,
                bottom: -25,
                opacity: 0.12,
                pointerEvents: 'none',
                zIndex: 1,
              }}
              aria-hidden="true"
            >
              <Train size={200} strokeWidth={1.5} color="#ffffff" />
            </div>

            {/* Left / Center Content */}
            <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'clamp(0.2rem, 0.8vw, 0.45rem)', minWidth: 0 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '0.15rem 0.5rem',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.16)',
                  color: activePromo.accentColor,
                  fontSize: 'clamp(0.58rem, 1.1vw, 0.72rem)',
                  fontWeight: 800,
                  width: 'fit-content',
                }}
              >
                <Sparkles size={11} /> {activePromo.badge}
              </span>

              <h3
                style={{
                  fontSize: 'clamp(0.82rem, 2.4vw, 1.35rem)',
                  fontWeight: 900,
                  lineHeight: 1.18,
                  color: 'white',
                  margin: 0,
                  letterSpacing: '-0.02em',
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              >
                {activePromo.headline}
              </h3>

              <p
                className="rh-promo-subtext"
                style={{
                  margin: 0,
                  color: 'rgba(255,255,255,0.88)',
                  fontSize: '0.82rem',
                  lineHeight: 1.35,
                  maxWidth: 480,
                }}
              >
                {activePromo.subtext}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.1rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => copyPromoCode(activePromo.code)}
                  className="rh-btn"
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    color: 'white',
                    border: '1px dashed rgba(255,255,255,0.5)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: 'clamp(0.65rem, 1.2vw, 0.78rem)',
                    padding: '0.25rem 0.55rem',
                    borderRadius: 8,
                  }}
                  title={lang === 'en' ? 'Copy promo code' : 'Salin kode promo'}
                >
                  <Copy size={12} /> {activePromo.code}
                </button>
                <Link
                  href="/trains"
                  className="rh-btn rh-btn-accent"
                  style={{
                    fontSize: 'clamp(0.65rem, 1.2vw, 0.78rem)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 8,
                    fontWeight: 700,
                  }}
                >
                  {lang === 'en' ? 'Use Deal' : 'Pakai Promo'} <ChevronRight size={13} />
                </Link>
              </div>
            </div>

            {/* Right Visual: Shown ONLY on Desktop/Tablet, Hidden on Mobile to prevent text collision */}
            <div className="rh-hide-mobile" style={{ zIndex: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <div
                className="rh-promo-attendant"
                style={{
                  background: 'rgba(255,255,255,0.14)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  borderRadius: 14,
                  padding: 'clamp(0.35rem, 1.2vw, 0.65rem) clamp(0.5rem, 1.5vw, 0.85rem)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  maxWidth: 240,
                }}
              >
                <div
                  style={{
                    width: 'clamp(28px, 4.5vw, 42px)',
                    height: 'clamp(28px, 4.5vw, 42px)',
                    borderRadius: '50%',
                    background: 'var(--rh-accent)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                    <circle cx="32" cy="22" r="10" fill="#FFF" />
                    <path d="M22 18C24 12 40 12 42 18L39 20H25L22 18Z" fill="#0F172A" />
                    <path d="M16 52C16 41 23 35 32 35C41 35 48 41 48 52H16Z" fill="#FFF" />
                  </svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: 'clamp(0.55rem, 1vw, 0.65rem)', fontWeight: 800, textTransform: 'uppercase', color: activePromo.accentColor, display: 'block' }}>
                    Hospitality
                  </span>
                  <strong style={{ display: 'block', fontSize: 'clamp(0.68rem, 1.2vw, 0.82rem)', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activePromo.attendantName}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '0.75rem' }}>
            {PROMO_BANNERS.map((banner, idx) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`${lang === 'en' ? 'Select deal' : 'Pilih promo'} ${idx + 1}`}
                onClick={() => setPromoIndex(idx)}
                style={{
                  width: promoIndex === idx ? 24 : 8,
                  height: 6,
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  background: promoIndex === idx ? 'var(--rh-primary)' : 'var(--rh-border)',
                  transition: 'background-color 0.25s ease, width 0.25s ease',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR ROUTES (Horizontal Swipe on Mobile, Grid on Desktop) ── */}
      <section className="rh-section" style={{ background: 'var(--rh-surface)', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="rh-container">
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span className="rh-badge rh-badge-primary" style={{ marginBottom: '0.25rem' }}>
                <Compass size={12} /> {lang === 'en' ? 'Popular Destinations' : 'Destinasi Terpopuler'}
              </span>
              <h2 className="rh-h3" style={{ margin: 0, color: 'var(--rh-navy)', fontSize: '1.25rem' }}>{lang === 'en' ? 'Favorite Routes' : 'Rute Favorit Penumpang'}</h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--rh-text-3)', fontWeight: 600 }}>
              {lang === 'en' ? 'Swipe for more routes →' : 'Geser untuk rute lainnya →'}
            </span>
          </div>

          {/* Horizontal swipeable track on mobile to eliminate vertical scrolling */}
          <div className="rh-popular-routes-track">
            {POPULAR_ROUTES.map((route, i) => (
              <Link
                key={i}
                href="/trains"
                onClick={event => openPopularRoute(event, route)}
                className="rh-card rh-card-interactive"
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  padding: '1rem',
                  background: '#ffffff',
                  border: '1px solid var(--rh-border)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  borderRadius: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--rh-primary)', background: 'var(--rh-primary-light)', padding: '0.12rem 0.5rem', borderRadius: 6 }}>
                    {lang === 'en' ? route.enTag : route.tag}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--rh-text-2)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={11} /> {lang === 'en' ? route.duration.replace('j', 'h') : route.duration}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.65rem' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--rh-primary-light)', display: 'grid', placeItems: 'center', color: 'var(--rh-primary)', flexShrink: 0 }}>
                    <Train size={15} />
                  </div>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--rh-charcoal)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {route.fromName} → {route.toName}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--rh-border)', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--rh-accent-dark)', fontWeight: 800 }}>
                    {lang === 'en' ? route.price.replace('Mulai', 'From') : route.price}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rh-primary)', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                    {lang === 'en' ? 'View' : 'Cek'} <ChevronRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLEET & CABIN COMFORT (ULTRA-MINIMAL 3 CARDS) ── */}
      <section className="rh-section home-fleet-section" style={{ background: '#ffffff', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="rh-container">
          <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
            <span className="rh-badge rh-badge-primary" style={{ marginBottom: '0.25rem' }}>
              <Train size={12} /> {lang === 'en' ? 'Service Classes' : 'Standar Layanan'}
            </span>
            <h2 className="rh-h3" style={{ margin: 0, color: 'var(--rh-navy)', fontSize: '1.25rem' }}>{lang === 'en' ? 'Choose Your Travel Class' : 'Pilihan Kelas Kereta'}</h2>
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

      {/* ── FAST CALL-TO-ACTION (COMPACT) ─────────────────── */}
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
