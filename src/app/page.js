'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SearchWidget from '@/components/booking/SearchWidget'
import MobilePortalHeader from '@/components/home/MobilePortalHeader'
import { useLang } from '@/contexts/LangContext'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import {
  ChevronRight,
  ChevronLeft,
  MapPin,
  Train,
  Wifi,
  Sparkles,
  Copy,
  BatteryCharging,
  Armchair,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Compass,
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
    gradient: 'linear-gradient(125deg, #0B1D42 0%, #1A428A 55%, #2A5CB5 100%)',
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
    gradient: 'linear-gradient(125deg, #0F2D3C 0%, #175466 55%, #207D8B 100%)',
    accentColor: '#FFA834',
  },
  {
    id: 'promo-3',
    badge: 'PAKET KELUARGA & ROMBONGAN',
    headline: 'PESAN HINGGA 6 PENUMPANG SEKALIGUS + BONUS RAILPOINTS',
    subtext: 'Duduk berdampingan satu keluarga dalam satu kode booking, lengkap dengan e-boarding pass QR instan.',
    code: 'KELUARGARAIL',
    attendantName: 'Petugas Hospitality Stasiun',
    attendantRole: 'Pendampingan Peron & Boarding',
    gradient: 'linear-gradient(125deg, #3D1010 0%, #7A2525 55%, #A83232 100%)',
    accentColor: '#FF8C00',
  },
]

const POPULAR_ROUTES = [
  { from: 'GMR', fromName: 'Gambir (Jakarta)',   to: 'BD',  toName: 'Bandung',         duration: '3j 00m', price: 'Mulai Rp 150.000', tag: 'Favorit Akhir Pekan' },
  { from: 'GMR', fromName: 'Gambir (Jakarta)',   to: 'YK',  toName: 'Yogyakarta',      duration: '7j 00m', price: 'Mulai Rp 250.000', tag: 'Rute Wisata' },
  { from: 'GMR', fromName: 'Gambir (Jakarta)',   to: 'SGU', toName: 'Surabaya Gubeng', duration: '8j 15m', price: 'Mulai Rp 350.000', tag: 'Lintas Pantura' },
  { from: 'BD',  fromName: 'Bandung',            to: 'SGU', toName: 'Surabaya Gubeng', duration: '11j 00m', price: 'Mulai Rp 300.000', tag: 'Lintas Selatan' },
  { from: 'YK',  fromName: 'Yogyakarta',         to: 'GMR', toName: 'Gambir (Jakarta)',duration: '7j 00m', price: 'Mulai Rp 250.000', tag: 'Bisnis & Wisata' },
  { from: 'SLO', fromName: 'Solo Balapan',       to: 'BD',  toName: 'Bandung',         duration: '8j 45m', price: 'Mulai Rp 195.000', tag: 'Antar Budaya' },
]

const FLEET_CLASSES = [
  {
    title: 'Luxury Sleeper',
    badge: 'Kenyamanan Tertinggi',
    desc: 'Kursi rebah 140° dengan sekat privat, audio-video on demand, lampu baca personal, dan hidangan gratis.',
    features: ['Reclining Seat 140°', 'Layar Sentuh Pribadi', 'Complimentary Food & Drink', 'WiFi Super Cepat'],
    gradient: 'linear-gradient(135deg, #1A428A 0%, #0F2552 100%)',
  },
  {
    title: 'Eksekutif Komersial',
    badge: 'Paling Populer',
    desc: 'Captain seat 2-2 ergonomis dengan ruang kaki sangat lega, stopkontak ganda di setiap kursi, dan AC sentral.',
    features: ['Captain Seat 2-2 Putar', 'Stopkontak Tiap Kursi', 'Meja Kerja Lipat', 'Akses Kafe Restorasi'],
    gradient: 'linear-gradient(135deg, #1A428A 0%, #2563EB 100%)',
  },
  {
    title: 'Ekonomi New Generation',
    badge: 'Terjangkau & Modern',
    desc: 'Desain kursi modifikasi 2-2 searah laju kereta, sandaran reclining yang nyaman, dan kabin bebas bising.',
    features: ['Kursi 2-2 Reclining', 'Kabin AC Sejuk & Bersih', 'Layar Informasi Stasiun', 'Toilet Ramah Difabel'],
    gradient: 'linear-gradient(135deg, #A83232 0%, #CC7000 100%)',
  },
]

export default function HomePage() {
  const { t } = useLang()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [promoIndex, setPromoIndex] = useState(0)

  // Auto rotate promo banners every 6 seconds
  useEffect(() => {
    const timer = window.setInterval(() => {
      setPromoIndex(prev => (prev + 1) % PROMO_BANNERS.length)
    }, 6000)
    return () => window.clearInterval(timer)
  }, [])

  if (authLoading) {
    return (
      <>
        <Navbar />
        <main className="rh-container" style={{ minHeight: '70vh', padding: '2.5rem 1.5rem' }} aria-busy="true" aria-live="polite">
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <div className="rh-skeleton" style={{ height: 260, borderRadius: 20 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem' }}>
              <div className="rh-skeleton" style={{ height: 140, borderRadius: 16 }} />
              <div className="rh-skeleton" style={{ height: 140, borderRadius: 16 }} />
              <div className="rh-skeleton" style={{ height: 140, borderRadius: 16 }} />
            </div>
          </div>
        </main>
      </>
    )
  }

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
    toast.success(`Kode promo ${code} berhasil disalin!`)
  }

  const activePromo = PROMO_BANNERS[promoIndex]

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <Navbar />

      {/* ── HERO & SEARCH SECTION ──────────────────────────── */}
      <section className="rh-hero" style={{ paddingBottom: '3rem' }}>
        <div className="rh-pattern-dots" style={{ position: 'absolute', inset: 0, opacity: 0.35 }} />

        <div className="rh-container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Mobile Super App Portal View (Greeting, RailPay, 9 Service Badges, Live Tracking Banner) */}
          <div className="rh-show-mobile-only" style={{ marginBottom: '1.25rem', paddingTop: '0.25rem' }}>
            <MobilePortalHeader />
          </div>

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
                <Train size={14} /> Railway Super App — Pulau Jawa
              </div>

              <h1 className="rh-h1" style={{ color: 'white', marginBottom: '1rem', maxWidth: 500, lineHeight: 1.18 }}>
                Pesan Tiket Kereta Cepat & Tanpa Antre
              </h1>

              <p className="rh-body-lg" style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '1.75rem', maxWidth: 440, lineHeight: 1.6 }}>
                Jelajahi 50 stasiun se-Pulau Jawa dengan pilihan kursi bebas per gerbong, e-boarding pass QR instan, dan live tracking kereta real-time.
              </p>

              {/* Fast stats pills */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.4rem', color: 'var(--rh-accent)', fontWeight: 800 }}>50</strong>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>Stasiun Aktif</span>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.15)' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '1.4rem', color: 'white', fontWeight: 800 }}>100%</strong>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>Anti Kursi Ganda</span>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.15)' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '1.4rem', color: '#10B981', fontWeight: 800 }}>QR Ready</strong>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>E-Boarding Pass</span>
                </div>
              </div>
            </div>

            {/* Elevated Search Widget Card */}
            <div className="animate-slide-right">
              <div className="rh-search-card" style={{ boxShadow: '0 12px 36px rgba(0,0,0,0.22)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem' }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--rh-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Train size={20} style={{ color: 'var(--rh-primary)' }} />
                    Cari Tiket Kereta Api
                  </h2>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rh-primary)', background: 'var(--rh-primary-light)', padding: '0.2rem 0.6rem', borderRadius: 999 }}>
                    Jadwal Resmi
                  </span>
                </div>
                <SearchWidget />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 SLIDING PROMO BANNERS (8:3 Ratio) ──────────── */}
      <section id="promos" className="rh-section" style={{ background: '#ffffff', paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
        <div className="rh-container">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <span className="rh-badge rh-badge-primary" style={{ marginBottom: '0.35rem' }}>
                <Sparkles size={13} /> Penawaran Terbatas
              </span>
              <h2 className="rh-h3" style={{ margin: 0, color: 'var(--rh-navy)' }}>Promo Perjalanan RAILHUB</h2>
            </div>

            {/* Slider controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                className="rh-btn rh-btn-ghost rh-btn-sm"
                aria-label="Banner sebelumnya"
                onClick={() => setPromoIndex(prev => (prev - 1 + PROMO_BANNERS.length) % PROMO_BANNERS.length)}
                style={{ borderRadius: '50%', width: 36, height: 36, padding: 0, display: 'grid', placeItems: 'center' }}
              >
                <ChevronLeft size={18} />
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--rh-text)' }}>
                {promoIndex + 1} / {PROMO_BANNERS.length}
              </span>
              <button
                type="button"
                className="rh-btn rh-btn-ghost rh-btn-sm"
                aria-label="Banner berikutnya"
                onClick={() => setPromoIndex(prev => (prev + 1) % PROMO_BANNERS.length)}
                style={{ borderRadius: '50%', width: 36, height: 36, padding: 0, display: 'grid', placeItems: 'center' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Active Promo Card (8:3 ratio) */}
          <div
            className="rh-promo-banner"
            style={{
              background: activePromo.gradient,
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
              borderRadius: 20,
              padding: 'clamp(1.5rem, 3.5vw, 2.5rem)',
            }}
          >
            <div style={{ zIndex: 2, display: 'grid', gap: '0.75rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  justifySelf: 'start',
                  padding: '0.3rem 0.75rem',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.15)',
                  color: activePromo.accentColor,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                }}
              >
                <Sparkles size={13} /> {activePromo.badge}
              </span>

              <h3
                style={{
                  fontSize: 'clamp(1.3rem, 2.4vw, 1.95rem)',
                  fontWeight: 900,
                  lineHeight: 1.2,
                  color: 'white',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                {activePromo.headline}
              </h3>

              <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '0.92rem', maxWidth: 540, lineHeight: 1.5 }}>
                {activePromo.subtext}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => copyPromoCode(activePromo.code)}
                  className="rh-btn rh-btn-sm"
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    color: 'white',
                    border: '1px dashed rgba(255,255,255,0.5)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                  }}
                  title="Klik untuk menyalin kode"
                >
                  <Copy size={14} /> {activePromo.code}
                </button>
                <Link href="/trains" className="rh-btn rh-btn-accent rh-btn-sm">
                  Gunakan Promo <ChevronRight size={15} />
                </Link>
              </div>
            </div>

            {/* Right: Attendant Hospitality Card */}
            <div
              className="rh-promo-attendant"
              style={{
                zIndex: 2,
                justifySelf: 'end',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.22)',
                borderRadius: 18,
                padding: '1rem 1.25rem',
                maxWidth: 320,
                width: '100%',
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--rh-accent), #CC7000)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
                }}
              >
                <svg width="36" height="36" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <circle cx="32" cy="22" r="10" fill="#FFF" />
                  <path d="M22 18C24 12 40 12 42 18L39 20H25L22 18Z" fill="#0F172A" />
                  <path d="M16 52C16 41 23 35 32 35C41 35 48 41 48 52H16Z" fill="#FFF" />
                  <path d="M28 35L32 43L36 35" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: activePromo.accentColor }}>
                  Hospitality Onboard
                </span>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'white', marginTop: 2 }}>
                  {activePromo.attendantName}
                </strong>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)' }}>
                  {activePromo.attendantRole}
                </span>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            {PROMO_BANNERS.map((banner, idx) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`Pilih promo ${idx + 1}`}
                onClick={() => setPromoIndex(idx)}
                style={{
                  width: promoIndex === idx ? 28 : 10,
                  height: 8,
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  background: promoIndex === idx ? 'var(--rh-primary)' : 'var(--rh-border)',
                  transition: 'all 0.25s ease',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR ROUTES (DESTINASI FAVORIT) ───────────── */}
      <section className="rh-section" style={{ background: 'var(--rh-surface)', paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
        <div className="rh-container">
          <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
            <span className="rh-badge rh-badge-primary" style={{ marginBottom: '0.4rem' }}>
              <Compass size={13} /> Destinasi Terpopuler
            </span>
            <h2 className="rh-h3" style={{ margin: 0, color: 'var(--rh-navy)' }}>Rute Favorit Penumpang</h2>
            <p style={{ margin: '0.35rem auto 0', color: 'var(--rh-text-2)', fontSize: '0.9rem', maxWidth: 520 }}>
              Pilih rute unggulan untuk langsung mencari ketersediaan tiket kereta tercepat besok.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1rem' }}>
            {POPULAR_ROUTES.map((route, i) => (
              <Link
                key={i}
                href="/trains"
                onClick={event => openPopularRoute(event, route)}
                className="rh-card rh-card-interactive"
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  padding: '1.15rem 1.25rem',
                  background: '#ffffff',
                  border: '1px solid var(--rh-border)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--rh-primary)', background: 'var(--rh-primary-light)', padding: '0.15rem 0.55rem', borderRadius: 6 }}>
                    {route.tag}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--rh-text-2)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={12} /> {route.duration}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--rh-primary-light)', display: 'grid', placeItems: 'center', color: 'var(--rh-primary)', flexShrink: 0 }}>
                    <Train size={17} />
                  </div>
                  <strong style={{ fontSize: '1rem', color: '#1E293B', letterSpacing: '-0.01em' }}>
                    {route.fromName} → {route.toName}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--rh-border)', paddingTop: '0.65rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--rh-accent-dark)', fontWeight: 800 }}>
                    {route.price}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--rh-primary)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    Cek Kursi <ChevronRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLEET & CABIN COMFORT (MINIMALIST SHOWCASE) ───── */}
      <section className="rh-section" style={{ background: '#ffffff', paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
        <div className="rh-container">
          <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
            <span className="rh-badge rh-badge-primary" style={{ marginBottom: '0.4rem' }}>
              <ShieldCheck size={13} /> Standar Layanan
            </span>
            <h2 className="rh-h3" style={{ margin: 0, color: 'var(--rh-navy)' }}>Pilihan Kelas Kereta</h2>
            <p style={{ margin: '0.35rem auto 0', color: 'var(--rh-text-2)', fontSize: '0.9rem', maxWidth: 520 }}>
              Dirancang untuk kenyamanan perjalanan jarak jauh dengan fasilitas kabin berstandar tinggi.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
            {FLEET_CLASSES.map(fc => (
              <div
                key={fc.title}
                className="rh-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: '#ffffff',
                  border: '1px solid var(--rh-border)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                  borderRadius: 18,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: 999, background: 'var(--rh-primary-light)', color: 'var(--rh-primary)' }}>
                      {fc.badge}
                    </span>
                    <Armchair size={18} style={{ color: 'var(--rh-primary)' }} />
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--rh-navy)', margin: '0 0 0.5rem' }}>
                    {fc.title}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--rh-text-2)', lineHeight: 1.55, margin: '0 0 1.25rem' }}>
                    {fc.desc}
                  </p>

                  <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    {fc.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#1E293B', fontWeight: 600 }}>
                        <CheckCircle2 size={15} style={{ color: 'var(--rh-success)', flexShrink: 0 }} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/trains"
                  className="rh-btn rh-btn-ghost rh-btn-sm"
                  style={{ width: '100%', justifyContent: 'center', fontWeight: 700 }}
                >
                  Pilih Kelas Ini <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
            <Link href="/about" className="rh-btn rh-btn-ghost rh-btn-sm" style={{ fontWeight: 700 }}>
              Pelajari Sejarah & Portofolio Tim RAILHUB <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAST CALL-TO-ACTION (COMPACT) ─────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #0F2552 0%, #1A428A 100%)', padding: '3.5rem 0', color: 'white' }}>
        <div className="rh-container" style={{ textAlign: 'center', maxWidth: 640 }}>
          <h2 className="rh-h2" style={{ color: 'white', marginBottom: '0.75rem' }}>
            Siap Memulai Perjalanan Anda?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.98rem', margin: '0 0 1.75rem', lineHeight: 1.6 }}>
            Dapatkan pengalaman pesan tiket kereta terbaik dengan e-boarding pass QR dan live tracking stasiun real-time.
          </p>
          <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/trains" className="rh-btn rh-btn-accent rh-btn-lg">
              Cari Tiket Sekarang <ChevronRight size={18} />
            </Link>
            <Link
              href="/faq"
              className="rh-btn rh-btn-lg"
              style={{
                background: 'rgba(255,255,255,0.12)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(8px)',
              }}
            >
              Pusat Bantuan & FAQ
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
