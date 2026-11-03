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
import PassengerDashboard from '@/app/dashboard/passenger/page'
import toast from 'react-hot-toast'
import {
  Shield,
  Zap,
  Smartphone,
  Clock,
  Star,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Train,
  Wifi,
  Coffee,
  Utensils,
  Luggage,
  TrendingUp,
  Users,
  Award,
  CheckCircle,
  Sparkles,
  Copy,
  BatteryCharging,
  Tv,
  Armchair,
  UserCheck,
  Wallet,
  QrCode,
  PlusCircle,
  Radio,
  Plane,
  Layers,
  Compass,
} from 'lucide-react'

const PROMO_BANNERS = [
  {
    id: 'promo-1',
    badge: 'PROMO EKSKLUSIF · PRAMUGARI RAILHUB',
    headline: 'DISKON 25% TIKET EKSEKUTIF SE-PULAU JAWA',
    subtext: 'Nikmati kursi rebah ergonomis, bistro restorasi hangat, dan pelayanan kru pramugari terbaik sepanjang perjalanan.',
    code: 'JELAJAHJAWA25',
    attendantName: 'Kru Layanan Eksekutif',
    attendantRole: 'Siap Melayani di Setiap Gerbong',
    gradient: 'linear-gradient(125deg, #0B1D42 0%, #1A428A 55%, #2A5CB5 100%)',
    accentColor: 'hsl(38, 95%, 56%)',
  },
  {
    id: 'promo-2',
    badge: 'EARLY BIRD · PEMESANAN JAUH HARI',
    headline: 'HEMAT RP 75.000 RUTE JAKARTA — YOGYAKARTA & SURABAYA',
    subtext: 'Pesan lebih awal untuk keberangkatan kereta unggulan Taksaka & Argo Bromo Anggrek dengan pilihan kursi bebas.',
    code: 'RAILHUBHEMAT75',
    attendantName: 'Pramugari Restorasi Onboard',
    attendantRole: 'Kuliner Hangat Diantar ke Kursi',
    gradient: 'linear-gradient(125deg, hsl(200, 75%, 14%) 0%, hsl(192, 85%, 30%) 55%, hsl(172, 70%, 38%) 100%)',
    accentColor: 'hsl(45, 96%, 58%)',
  },
  {
    id: 'promo-3',
    badge: 'PAKET ROMBONGAN & KELUARGA',
    headline: 'PESAN HINGGA 6 PENUMPANG SEKALIGUS + BONUS RAILPOINTS',
    subtext: 'Duduk berdampingan satu keluarga dalam satu kode booking, lengkap dengan e-boarding pass QR instan.',
    code: 'KELUARGARAIL',
    attendantName: 'Petugas Hospitality Stasiun',
    attendantRole: 'Pendampingan Peron & Boarding',
    gradient: 'linear-gradient(125deg, #4A1414 0%, #A83232 55%, #FF8C00 100%)',
    accentColor: 'hsl(38, 95%, 56%)',
  },
]

const POPULAR_ROUTES = [
  { from: 'GMR', fromName: 'Gambir',        to: 'SGU', toName: 'Surabaya Gubeng', duration: '8j 15m', price: 'Mulai Rp 350.000' },
  { from: 'GMR', fromName: 'Gambir',        to: 'YK',  toName: 'Yogyakarta',      duration: '7j 0m',  price: 'Mulai Rp 250.000' },
  { from: 'GMR', fromName: 'Gambir',        to: 'BD',  toName: 'Bandung',         duration: '3j 0m',  price: 'Mulai Rp 150.000' },
  { from: 'BD',  fromName: 'Bandung',       to: 'SGU', toName: 'Surabaya Gubeng', duration: '11j 0m', price: 'Mulai Rp 300.000' },
  { from: 'YK',  fromName: 'Yogyakarta',    to: 'GMR', toName: 'Gambir',          duration: '7j 0m',  price: 'Mulai Rp 250.000' },
  { from: 'SLO', fromName: 'Solo Balapan',  to: 'BD',  toName: 'Bandung',         duration: '8j 45m', price: 'Mulai Rp 195.000' },
]

const TRAINS = [
  {
    name: 'Argo Bromo Anggrek',
    number: 'KA 1',
    class: 'Eksekutif & Luxury',
    route: 'Gambir → Surabaya Gubeng',
    color: '#1A428A',
    facilities: ['Reclining Seat 140°', 'WiFi Kabin', 'Layar VOD', 'Restorasi Bistro', 'Stopkontak USB/AC'],
    cabinVisual: 'Suite Luxury & Kabin Eksekutif Kedap Suara',
  },
  {
    name: 'Argo Parahyangan',
    number: 'KA 34',
    class: 'Eksekutif & Ekonomi',
    route: 'Gambir → Bandung',
    color: 'hsl(142, 70%, 45%)',
    facilities: ['Jendela Panoramik', 'Stopkontak Kursi', 'Meja Lipat Kerja', 'Kafe Kereta', 'Bagasi Kabin'],
    cabinVisual: 'Kabin Panoramik Koridor Priangan',
  },
  {
    name: 'Taksaka',
    number: 'KA 68',
    class: 'Eksekutif',
    route: 'Gambir → Yogyakarta',
    color: 'hsl(260, 75%, 55%)',
    facilities: ['Captain Seat Ergonomis', 'WiFi Gratis', 'Lampu Baca Personal', 'Toilet Vakum', 'Pesan Makan QR'],
    cabinVisual: 'Kabin Hype Trip Modern',
  },
  {
    name: 'Argo Wilis',
    number: 'KA 6',
    class: 'Eksekutif',
    route: 'Bandung → Surabaya Gubeng',
    color: 'hsl(38, 95%, 52%)',
    facilities: ['Kursi Putar 360°', 'Kuliner Nusantara', 'AC Sentral Adaptif', 'Bantal & Selimut', 'Layanan Pramugari'],
    cabinVisual: 'Kabin Eksekutif Lintas Selatan',
  },
  {
    name: 'Lodaya',
    number: 'KA 92',
    class: 'Eksekutif & Ekonomi',
    route: 'Bandung → Solo Balapan',
    color: 'hsl(0, 72%, 51%)',
    facilities: ['New Generation Seat', 'Layar Info Stasiun', 'Stopkontak Tiap Baris', 'Mushola Kereta', 'Restorasi'],
    cabinVisual: 'Kabin New Generation Ramah Keluarga',
  },
]

const GALLERY_ITEMS = [
  {
    tag: 'Kabin Eksekutif',
    title: 'Kursi Captain Seat dengan Ruang Kaki Luas',
    caption: 'Dilengkapi sandaran kaki, meja lipat kerja, serta stopkontak individu di setiap bangku.',
    icon: Armchair,
    tone: 'linear-gradient(135deg, #12306A, #2A5CB5)',
  },
  {
    tag: 'Kereta Makan & Bistro',
    title: 'Sajian Kuliner Hangat Langsung ke Kursi Anda',
    caption: 'Pesan makanan dan minuman dari aplikasi RAILHUB dan diantar oleh pramugari kereta.',
    icon: Utensils,
    tone: 'linear-gradient(135deg, hsl(28, 85%, 28%), hsl(38, 92%, 48%))',
  },
  {
    tag: 'Konektivitas & Hiburan',
    title: 'Produktif Sepanjang Lintasan Pulau Jawa',
    caption: 'Akses WiFi onboard, pengisian daya cepat, dan pelacakan posisi stasiun secara real-time.',
    icon: Wifi,
    tone: 'linear-gradient(135deg, hsl(192, 82%, 22%), hsl(184, 78%, 38%))',
  },
  {
    tag: 'Smart Boarding Gate',
    title: 'E-Boarding Pass QR & Informasi Peron Akurat',
    caption: 'Cukup pindai kode QR tiket digital Anda kepada petugas kondektur tanpa perlu cetak kertas.',
    icon: UserCheck,
    tone: 'linear-gradient(135deg, hsl(255, 65%, 26%), hsl(245, 75%, 48%))',
  },
]

const FEATURES = [
  { icon: Shield, title: 'Aman & Terpercaya', desc: 'Sistem keamanan berlapis dengan RLS database dan validasi tiket real-time.' },
  { icon: Zap,    title: 'Pemesanan Instan',  desc: 'Proses pilih kursi dan konfirmasi langsung dengan penguncian kursi anti-ganda.' },
  { icon: Smartphone, title: 'Mobile-First', desc: 'Dirancang seperti aplikasi mobile modern dengan navigasi cepat di smartphone.' },
  { icon: Clock,  title: 'Layanan 24/7',      desc: 'Dukungan petugas kondektur dan pusat layanan pelanggan sepanjang waktu.' },
]

const TESTIMONIALS = [
  { name: 'Rina Marlina', city: 'Jakarta', rating: 5, text: 'RAILHUB mengubah cara saya bepergian. Tiket digital QR dan info nomor peron sangat memudahkan saat di Gambir!' },
  { name: 'Budi Santoso', city: 'Bandung', rating: 5, text: 'Antarmuka sangat bersih dan pilih kursi per gerbongnya jelas sekali. Pesan makan di kereta juga praktis.' },
  { name: 'Sari Dewi',    city: 'Surabaya', rating: 5, text: 'Animasi pelacakan perjalanan dan hitung mundur keberangkatan membuat saya tenang selama perjalanan.' },
]

const STATS = [
  { icon: Users, value: '50K+', label: 'Penumpang Terlayani' },
  { icon: Train, value: '5', label: 'Armada Utama' },
  { icon: MapPin, value: '50', label: 'Stasiun Aktif' },
  { icon: TrendingUp, value: '99%', label: 'Ketepatan Layanan' },
]

const FAQS = [
  { q: 'Bagaimana cara memesan tiket?', a: 'Pilih stasiun asal, tujuan, tanggal keberangkatan, dan jumlah penumpang, lalu pilih jadwal kereta serta nomor kursi.' },
  { q: 'Apakah tiket digital QR diterima saat boarding?', a: 'Ya, e-boarding pass dengan QR code langsung divalidasi oleh petugas kondektur yang bertugas di jadwal Anda.' },
  { q: 'Bagaimana ketentuan reschedule & pembatalan?', a: 'Dapat diajukan hingga 24 jam sebelum keberangkatan melalui halaman detail tiket di Dashboard Penumpang.' },
]

function SectionTitle({ label, title, centered = false }) {
  return (
    <div style={{ marginBottom: '2.5rem', textAlign: centered ? 'center' : 'left', maxWidth: centered ? 620 : undefined, margin: centered ? '0 auto 2.5rem' : '0 0 2.5rem' }}>
      <div className="rh-badge rh-badge-primary" style={{ marginBottom: '0.65rem' }}>{label}</div>
      <h2 className="rh-h2">{title}</h2>
    </div>
  )
}

export default function HomePage() {
  const { t } = useLang()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [promoIndex, setPromoIndex] = useState(0)
  const [selectedTrain, setSelectedTrain] = useState(TRAINS[0])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPromoIndex(prev => (prev + 1) % PROMO_BANNERS.length)
    }, 5500)
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

  if (false && user && (!profile || profile.role === 'passenger')) {
    // Passenger views home page with personalized cards and dashboard navigation
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
    toast.success(`Kode promo ${code} disalin!`)
  }

  const activePromo = PROMO_BANNERS[promoIndex]

  return (
    <div style={{ paddingBottom: '3.5rem' }}>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="rh-hero">
        <div className="rh-pattern-dots" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />

        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,66,138,0.15) 0%, transparent 70%)',
          top: -100, right: -50, pointerEvents: 'none'
        }} />

        <div className="rh-container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Mobile Super App Portal View (Screenshot 1: Greeting, RailPay, 9 Service Badges, Live Tracking) */}
          <div className="rh-show-mobile-only" style={{ marginBottom: '1.5rem', paddingTop: '0.5rem' }}>
            <MobilePortalHeader />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 310px), 1fr))', gap: 'clamp(1.5rem, 4vw, 3rem)', alignItems: 'center' }}>
            {/* Left: Headlines (Desktop / Tablet) */}
            <div className="animate-fade-in rh-hide-mobile">
              <div className="rh-badge" style={{
                background: 'rgba(255,255,255,0.1)', color: 'var(--rh-accent)',
                border: '1px solid rgba(255,255,255,0.15)', marginBottom: '1.5rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.45rem'
              }}>
                <Train size={14} /> Railway Super App — Pulau Jawa
              </div>
              <h1 className="rh-h1" style={{ color: 'white', marginBottom: '1.25rem', maxWidth: 480 }}>
                {t.hero.title}
              </h1>
              <p className="rh-body-lg" style={{ color: 'rgba(255,255,255,0.82)', marginBottom: '2rem', maxWidth: 420 }}>
                {t.hero.subtitle}
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link href="/trains" className="rh-btn rh-btn-accent rh-btn-lg">
                  {t.common.getStarted} <ChevronRight size={18} />
                </Link>
                <Link href="/about" className="rh-btn rh-btn-lg" style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white', border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)'
                }}>
                  {t.common.learnMore}
                </Link>
              </div>

              {/* Stats Row */}
              <div style={{ display: 'flex', gap: '2rem', marginTop: '2.75rem', flexWrap: 'wrap' }}>
                {STATS.map(({ value, label }) => (
                  <div key={label}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--rh-accent)' }}>{value}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.75)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Search Card */}
            <div className="animate-slide-right">
              <div className="rh-search-card">
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--rh-text)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Train size={20} style={{ color: 'var(--rh-primary)' }} />
                  {t.hero.searchTitle}
                </h2>
                <SearchWidget />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KAI APP / RAILHUB MOBILE REFERENCE QUICK SERVICES & LIVE TRACKING ── */}
      <section style={{ background: 'var(--rh-surface)', padding: '1.75rem 0', borderBottom: '1px solid var(--rh-border)' }}>
        <div className="rh-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem', alignItems: 'stretch' }}>
            {/* Left: RailPay & RailPoints Wallet Card (KAI Pay mockup from Reference Image 2) */}
            <div className="rh-card" style={{
              background: 'linear-gradient(135deg, #1A428A 0%, #12306A 100%)',
              color: 'white',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-md)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.75)' }}>
                    Dompet Digital Kereta Api
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 2 }}>
                    <Wallet size={18} style={{ color: 'var(--rh-accent)' }} />
                    <strong style={{ fontSize: '1.15rem', color: 'white', letterSpacing: '-0.01em' }}>RailPay</strong>
                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 999, background: 'rgba(255,255,255,0.15)', color: '#FFD700', fontWeight: 700 }}>
                      Terverifikasi
                    </span>
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'white', marginTop: '0.35rem' }}>
                    Rp 350.000
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.12)',
                  borderRadius: 12,
                  padding: '0.5rem 0.75rem',
                  textAlign: 'right',
                  border: '1px solid rgba(255,255,255,0.18)',
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)' }}>RailPoints</div>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--rh-accent)' }}>1.250 Poin</strong>
                  <div style={{ fontSize: '0.65rem', color: '#E2E8F0', marginTop: 1 }}>Tier: Gold Member</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <Link href={user ? "/dashboard/passenger?tab=account" : "/auth/login"} className="rh-btn rh-btn-sm" style={{
                  background: 'white', color: 'var(--rh-primary)', fontWeight: 700, fontSize: '0.78rem', padding: '0.45rem 0.85rem'
                }}>
                  <Sparkles size={14} /> Aktivasi RailPay
                </Link>
                <Link href={user ? "/dashboard/passenger?tab=tickets" : "/auth/login"} className="rh-btn rh-btn-sm" style={{
                  background: 'rgba(255,255,255,0.18)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', fontSize: '0.78rem', padding: '0.45rem 0.85rem'
                }}>
                  <QrCode size={14} /> Scan Tiket
                </Link>
                <button type="button" onClick={() => toast.success('Simulasi Top Up RailPay Rp 100.000 berhasil!')} className="rh-btn rh-btn-sm" style={{
                  background: 'var(--rh-accent)', color: '#0F2552', fontWeight: 700, fontSize: '0.78rem', padding: '0.45rem 0.85rem'
                }}>
                  <PlusCircle size={14} /> Top Up
                </button>
              </div>
            </div>

            {/* Right: Live Tracking Banner (KAI Reference Image 2: "Live Tracking - Lihat lokasi dan status perjalanan...") */}
            <div className="rh-card" style={{
              background: 'linear-gradient(135deg, #A83232 0%, #821F1F 55%, #1A428A 100%)',
              color: 'white',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-md)',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span style={{
                    background: '#FF8C00', color: '#0F2552', padding: '0.15rem 0.55rem', borderRadius: 999,
                    fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em'
                  }}>
                    Fitur Baru
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>
                    <Radio size={14} style={{ color: '#FF8C00' }} className="animate-pulse" /> Live Tracking Kereta
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: '0 0 0.35rem' }}>
                  Pantau Lokasi & Perjalanan Kereta Secara Real-Time
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
                  Lihat estimasi kedatangan stasiun, peron keberangkatan, serta animasi pergerakan kereta di lintasan ala aplikasi modern.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={13} style={{ color: '#FF8C00' }} /> Stasiun Utama Se-Pulau Jawa
                </span>
                <Link href={user ? "/dashboard/passenger?tab=journey" : "/trains"} className="rh-btn rh-btn-sm" style={{
                  background: '#FF8C00', color: '#0F2552', fontWeight: 800, fontSize: '0.8rem', padding: '0.5rem 1rem'
                }}>
                  Buka Live Tracking <ChevronRight size={15} />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Service Category Icons (Access by KAI layout: Antar Kota, Lokal, Komuter, LRT, Bandara) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))',
            gap: '0.75rem',
            marginTop: '1.25rem',
          }}>
            {[
              { title: 'Antar Kota', sub: 'Eksekutif & Luxury', icon: Train, href: '/trains?from=GMR&to=SGU&pax=1', color: '#1A428A' },
              { title: 'Kereta Lokal', sub: 'Lintas Daerah', icon: Compass, href: '/trains?from=BD&to=SLO&pax=1', color: '#A83232' },
              { title: 'Komuter (KRL)', sub: 'Jabodetabek & Jogja', icon: Zap, href: '/trains?from=GMR&to=BD&pax=1', color: '#FF8C00' },
              { title: 'LRT Terpadu', sub: 'Koneksi Transit', icon: Layers, href: '/trains?from=GMR&to=YK&pax=1', color: '#1A428A' },
              { title: 'Kereta Bandara', sub: 'Akses Cepat Airport', icon: Plane, href: '/trains?from=GMR&to=BD&pax=1', color: '#4F4F4F' },
            ].map((cat) => {
              const CatIcon = cat.icon
              return (
                <Link
                  key={cat.title}
                  href={cat.href}
                  className="rh-card rh-card-interactive"
                  style={{
                    padding: '0.85rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    textDecoration: 'none',
                    background: 'white',
                    border: '1px solid var(--rh-border)',
                  }}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${cat.color}14`,
                    color: cat.color,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}>
                    <CatIcon size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ display: 'block', fontSize: '0.82rem', color: 'var(--rh-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cat.title}
                    </strong>
                    <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--rh-text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cat.sub}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 3 SLIDING PROMO BANNERS (RATIO 8:3) ───────────── */}
      <section id="promos" className="rh-section" style={{ background: 'var(--rh-white)', paddingBottom: '2rem' }}>
        <div className="rh-container">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <span className="rh-badge rh-badge-primary" style={{ marginBottom: '0.4rem' }}>
                <Sparkles size={13} /> Penawaran Spesial
              </span>
              <h2 className="rh-h3" style={{ margin: 0 }}>Promo Perjalanan RAILHUB</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                className="rh-btn rh-btn-ghost rh-btn-sm"
                aria-label="Banner sebelumnya"
                onClick={() => setPromoIndex(prev => (prev - 1 + PROMO_BANNERS.length) % PROMO_BANNERS.length)}
              >
                <ChevronLeft size={18} />
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                {promoIndex + 1} / {PROMO_BANNERS.length}
              </span>
              <button
                type="button"
                className="rh-btn rh-btn-ghost rh-btn-sm"
                aria-label="Banner berikutnya"
                onClick={() => setPromoIndex(prev => (prev + 1) % PROMO_BANNERS.length)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div
            className="rh-promo-banner"
            style={{
              background: activePromo.gradient,
            }}
          >
            <div style={{ zIndex: 2, display: 'grid', gap: '0.75rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                justifySelf: 'start', padding: '0.3rem 0.75rem', borderRadius: 999,
                background: 'rgba(255,255,255,0.14)', color: activePromo.accentColor,
                fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em',
              }}>
                <Sparkles size={13} /> {activePromo.badge}
              </span>
              <h1 style={{
                fontSize: 'clamp(1.35rem, 2.6vw, 2.15rem)',
                fontWeight: 900,
                lineHeight: 1.18,
                color: 'white',
                margin: 0,
              }}>
                {activePromo.headline}
              </h1>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.88)', fontSize: '0.95rem', maxWidth: 560 }}>
                {activePromo.subtext}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => copyPromoCode(activePromo.code)}
                  className="rh-btn rh-btn-sm"
                  style={{
                    background: 'rgba(255,255,255,0.16)',
                    color: 'white',
                    border: '1px dashed rgba(255,255,255,0.45)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <Copy size={14} /> {activePromo.code}
                </button>
                <Link href="/trains" className="rh-btn rh-btn-accent rh-btn-sm">
                  Pakai Promo Sekarang <ChevronRight size={15} />
                </Link>
              </div>
            </div>

            {/* Right visual: Pramugari / Hospitality Crew Card */}
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
                maxWidth: 340,
                width: '100%',
              }}
            >
              <div style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--rh-accent), hsl(28, 90%, 48%))',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
              }}>
                <svg width="42" height="42" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <circle cx="32" cy="22" r="10" fill="#FFF" />
                  <path d="M22 18C24 12 40 12 42 18L39 20H25L22 18Z" fill="#0F172A" />
                  <path d="M16 52C16 41 23 35 32 35C41 35 48 41 48 52H16Z" fill="#FFF" />
                  <path d="M28 35L32 43L36 35" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: activePromo.accentColor }}>
                  Hospitality Onboard
                </span>
                <strong style={{ display: 'block', fontSize: '1rem', color: 'white', marginTop: 2 }}>
                  {activePromo.attendantName}
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)' }}>
                  {activePromo.attendantRole}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.9rem' }}>
            {PROMO_BANNERS.map((banner, idx) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`Pilih promo ${idx + 1}`}
                onClick={() => setPromoIndex(idx)}
                style={{
                  width: promoIndex === idx ? 28 : 10,
                  height: 10,
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  background: promoIndex === idx ? 'var(--rh-primary)' : 'var(--rh-border)',
                  transition: 'all 0.25s',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR ROUTES ───────────────────────────────── */}
      <section className="rh-section" style={{ background: 'var(--rh-white)', paddingTop: '2rem' }}>
        <div className="rh-container">
          <SectionTitle
            label="Rute Populer"
            title="Destinasi Favorit Penumpang"
            centered
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
            {POPULAR_ROUTES.map((route, i) => (
              <Link
                key={i}
                href="/trains"
                onClick={event => openPopularRoute(event, route)}
                className="rh-card rh-card-interactive"
                style={{ display: 'block', textDecoration: 'none' }}
              >
                <div className="rh-card-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, background: 'var(--rh-primary-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Train size={16} style={{ color: 'var(--rh-primary)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--rh-text)' }}>
                        {route.fromName} → {route.toName}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--rh-text-2)' }}> Estimasi {route.duration}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--rh-primary)', fontWeight: 700 }}>{route.price}</span>
                    <ChevronRight size={16} style={{ color: 'var(--rh-text-2)' }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED TRAINS & FACILITY DETAILS ──────────── */}
      <section className="rh-section" style={{ background: 'var(--rh-surface)' }}>
        <div className="rh-container">
          <SectionTitle
            label="Armada & Fasilitas Kereta"
            title="Kereta Unggulan & Detail Fasilitas Kabin"
            centered
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.15rem', marginBottom: '1.5rem' }}>
            {TRAINS.map((train) => {
              const isSelected = selectedTrain.number === train.number
              return (
                <button
                  key={train.name}
                  type="button"
                  onClick={() => setSelectedTrain(train)}
                  className="rh-card rh-card-interactive"
                  style={{
                    textAlign: 'left',
                    cursor: 'pointer',
                    border: isSelected ? `2px solid ${train.color}` : '1px solid var(--rh-border)',
                  }}
                >
                  <div style={{
                    height: 6, background: train.color,
                    borderRadius: '12px 12px 0 0'
                  }} />
                  <div className="rh-card-body">
                    <div style={{ marginBottom: '0.65rem' }}>
                      <div style={{
                        display: 'inline-block', padding: '0.25rem 0.625rem',
                        background: train.color + '18', borderRadius: 6,
                        fontSize: '0.6875rem', fontWeight: 800, fontFamily: 'var(--font-mono)',
                        color: train.color, marginBottom: '0.5rem'
                      }}>
                        {train.number}
                      </div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--rh-text)', margin: 0 }}>{train.name}</h3>
                    </div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--rh-primary)', marginBottom: '0.4rem' }}>{train.class}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--rh-text-2)' }}>
                      <MapPin size={12} /> {train.route}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Selected Train Facility Showcase */}
          <div className="rh-card" style={{ overflow: 'hidden' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: '1.5rem',
              padding: 'clamp(1rem, 3vw, 1.5rem)',
              alignItems: 'center',
            }}>
              <div style={{
                borderRadius: 16,
                padding: 'clamp(1.25rem, 3vw, 2rem)',
                background: 'linear-gradient(135deg, var(--rh-navy) 0%, #16346F 100%)',
                color: 'white',
                display: 'grid',
                gap: '0.75rem',
              }}>
                <span className="rh-badge" style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--rh-accent)', justifySelf: 'start' }}>
                  Visualisasi Fasilitas · {selectedTrain.number}
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', margin: 0 }}>
                  {selectedTrain.name}
                </h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '0.92rem' }}>
                  {selectedTrain.cabinVisual} · Rute {selectedTrain.route}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.35rem 0.65rem', borderRadius: 8 }}>
                    <Wifi size={14} /> Free WiFi
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.35rem 0.65rem', borderRadius: 8 }}>
                    <BatteryCharging size={14} /> Power Outlet
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.35rem 0.65rem', borderRadius: 8 }}>
                    <Tv size={14} /> Hiburan Kabin
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '0.85rem' }}>
                <strong style={{ fontSize: '1.05rem' }}>Fasilitas Unggulan {selectedTrain.name}:</strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: '0.6rem' }}>
                  {selectedTrain.facilities.map(fac => (
                    <div key={fac} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.85rem', borderRadius: 10, background: 'var(--rh-surface)', fontWeight: 600, fontSize: '0.875rem' }}>
                      <CheckCircle size={16} style={{ color: 'var(--rh-success)', flexShrink: 0 }} />
                      <span>{fac}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '0.35rem' }}>
                  <Link href="/trains" className="rh-btn rh-btn-primary rh-btn-sm">
                    Cek Jadwal {selectedTrain.name} <ChevronRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY SECTION ──────────────────────────────── */}
      <section className="rh-section" style={{ background: 'var(--rh-white)' }}>
        <div className="rh-container">
          <SectionTitle
            label="Galeri Layanan"
            title="Suasana Kabin & Pengalaman Perjalanan"
            centered
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.25rem' }}>
            {GALLERY_ITEMS.map(({ tag, title, caption, icon: Icon, tone }) => (
              <article key={title} className="rh-card" style={{ overflow: 'hidden' }}>
                <div style={{
                  height: 155,
                  background: tone,
                  padding: '1.25rem',
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ alignSelf: ' flex-start', padding: '0.25rem 0.65rem', borderRadius: 999, background: 'rgba(255,255,255,0.16)', fontSize: '0.72rem', fontWeight: 700 }}>
                    {tag}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.18)', display: 'grid', placeItems: 'center' }}>
                      <Icon size={22} />
                    </div>
                    <strong style={{ fontSize: '0.98rem', lineHeight: 1.3 }}>{title}</strong>
                  </div>
                </div>
                <div className="rh-card-body">
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--rh-text-2)', lineHeight: 1.6 }}>
                    {caption}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section className="rh-section" style={{ background: 'var(--rh-navy)' }}>
        <div className="rh-container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="rh-badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--rh-accent)', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '0.75rem' }}>
              Mengapa RAILHUB?
            </div>
            <h2 className="rh-h2" style={{ color: 'white', maxWidth: 500, margin: '0 auto' }}>Pengalaman Perjalanan yang Berbeda</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.5rem' }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{
                padding: '1.75rem',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, marginBottom: '1.25rem',
                  background: 'linear-gradient(135deg, var(--rh-primary), #12306A)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'var(--shadow-primary)'
                }}>
                  <Icon size={24} color="white" />
                </div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'white', marginBottom: '0.625rem' }}>{title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section className="rh-section" style={{ background: 'var(--rh-surface)' }}>
        <div className="rh-container">
          <SectionTitle
            label="Testimoni"
            title="Apa Kata Penumpang?"
            centered
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.5rem' }}>
            {TESTIMONIALS.map(({ name, city, rating, text }) => (
              <div key={name} className="rh-card rh-card-interactive">
                <div className="rh-card-body">
                  <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} size={16} fill="var(--rh-accent)" stroke="var(--rh-accent)" />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--rh-text)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                    &ldquo;{text}&rdquo;
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--rh-primary), #12306A)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '0.9rem'
                    }}>
                      {name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--rh-text)' }}>{name}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--rh-text-2)' }}>{city}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ PREVIEW ──────────────────────────────────── */}
      <section className="rh-section" style={{ background: 'var(--rh-white)' }}>
        <div className="rh-container" style={{ maxWidth: 720 }}>
          <SectionTitle label="FAQ" title="Pertanyaan Umum" centered />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {FAQS.map(({ q, a }) => (
              <div key={q} className="rh-card">
                <div className="rh-card-body">
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--rh-text)', marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--rh-primary)' }}>Q.</span> {q}
                  </h3>
                  <p style={{ color: 'var(--rh-text-2)', margin: 0, fontSize: '0.9375rem' }}>{a}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link href="/faq" className="rh-btn rh-btn-secondary">
              Lihat Semua FAQ <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, var(--rh-primary) 0%, #12306A 100%)', padding: '4.5rem 0' }}>
        <div className="rh-container" style={{ textAlign: 'center' }}>
          <h2 className="rh-h2" style={{ color: 'white', marginBottom: '1rem' }}>
            Siap Memulai Perjalanan?
          </h2>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <Link href="/auth/register" className="rh-btn rh-btn-xl" style={{ background: 'white', color: 'var(--rh-primary)' }}>
              Daftar Gratis
            </Link>
            <Link href="/trains" className="rh-btn rh-btn-xl" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.3)' }}>
              Cari Tiket Sekarang
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
