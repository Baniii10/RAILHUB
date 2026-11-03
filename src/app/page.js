'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SearchWidget from '@/components/booking/SearchWidget'
import { useLang } from '@/contexts/LangContext'
import { useAuth } from '@/contexts/AuthContext'
import PassengerDashboard from '@/app/dashboard/passenger/page'
import {
  Shield, Zap, Smartphone, Clock, Star, ChevronRight,
  MapPin, Train, Wifi, Coffee, Utensils, Luggage,
  TrendingUp, Users, Award, CheckCircle
} from 'lucide-react'

// ─── Data ───────────────────────────────────────────────────────────────────
const POPULAR_ROUTES = [
  { from: 'GMR', fromName: 'Gambir',        to: 'SGU', toName: 'Surabaya Gubeng', duration: '8j 15m', price: 'ab Rp 350.000' },
  { from: 'GMR', fromName: 'Gambir',        to: 'YK',  toName: 'Yogyakarta',      duration: '7j 0m',  price: 'ab Rp 250.000' },
  { from: 'GMR', fromName: 'Gambir',        to: 'BD',  toName: 'Bandung',         duration: '3j 30m', price: 'ab Rp 150.000' },
  { from: 'BD',  fromName: 'Bandung',       to: 'SGU', toName: 'Surabaya Gubeng', duration: '11j 0m', price: 'ab Rp 300.000' },
  { from: 'YK',  fromName: 'Yogyakarta',    to: 'GMR', toName: 'Gambir',          duration: '7j 0m',  price: 'ab Rp 250.000' },
  { from: 'SLO', fromName: 'Solo Balapan',  to: 'BD',  toName: 'Bandung',         duration: '8j 45m', price: 'ab Rp 195.000' },
]

const TRAINS = [
  { name: 'Argo Bromo Anggrek', number: 'KA 1', class: 'Eksekutif & Luxury', route: 'Gambir → Surabaya Gubeng', color: 'hsl(215, 90%, 52%)' },
  { name: 'Argo Parahyangan',   number: 'KA 34', class: 'Eksekutif & Ekonomi', route: 'Gambir → Bandung', color: 'hsl(142, 70%, 45%)' },
  { name: 'Taksaka',            number: 'KA 68', class: 'Eksekutif', route: 'Gambir → Yogyakarta', color: 'hsl(260, 75%, 55%)' },
  { name: 'Argo Wilis',         number: 'KA 6',  class: 'Eksekutif', route: 'Bandung → Surabaya Gubeng', color: 'hsl(38, 95%, 52%)' },
  { name: 'Lodaya',             number: 'KA 92', class: 'Eksekutif & Ekonomi', route: 'Bandung → Solo Balapan', color: 'hsl(0, 72%, 51%)' },
]

const FEATURES = [
  { icon: Shield, title: 'Aman & Terpercaya', desc: 'Sistem keamanan berlapis dengan enkripsi data dan validasi tiket real-time.' },
  { icon: Zap,    title: 'Pemesanan Instan',  desc: 'Proses booking cepat dalam hitungan menit, konfirmasi langsung via notifikasi.' },
  { icon: Smartphone, title: 'Mobile-First', desc: 'Dirancang untuk pengalaman terbaik di smartphone — kapan saja, di mana saja.' },
  { icon: Clock,  title: 'Layanan 24/7',      desc: 'Dukungan pelanggan sepanjang waktu untuk perjalanan yang bebas khawatir.' },
]

const TESTIMONIALS = [
  { name: 'Rina Marlina', city: 'Jakarta', rating: 5, text: 'RAILHUB mengubah cara saya bepergian. Tiket digital sangat memudahkan dan tidak perlu antri lagi!' },
  { name: 'Budi Santoso', city: 'Bandung', rating: 5, text: 'Antarmuka yang sangat bersih dan mudah. Fitur pilih kursi visualnya keren sekali.' },
  { name: 'Sari Dewi',    city: 'Surabaya', rating: 5, text: 'Pelacakan perjalanan real-time membuat saya tenang selama perjalanan panjang.' },
]

const STATS = [
  { icon: Users, value: '50K+', label: 'Pengguna Aktif' },
  { icon: Train, value: '5', label: 'Armada Kereta' },
  { icon: MapPin, value: '10', label: 'Stasiun Utama' },
  { icon: TrendingUp, value: '99%', label: 'Kepuasan Pelanggan' },
]

const FAQS = [
  { q: 'Bagaimana cara memesan tiket?', a: 'Masukkan stasiun asal, tujuan, dan tanggal perjalanan pada form pencarian, lalu pilih kereta dan kursi yang diinginkan.' },
  { q: 'Apakah tiket digital diterima?', a: 'Ya, tiket digital dengan QR code sepenuhnya diterima. Tunjukkan ke petugas saat boarding.' },
  { q: 'Bagaimana jika ingin membatalkan?', a: 'Pembatalan dapat dilakukan melalui dashboard penumpang, sesuai dengan ketentuan yang berlaku.' },
]

// ─── Component ───────────────────────────────────────────────────────────────

function SectionTitle({ label, title, subtitle, centered = false }) {
  return (
    <div style={{ marginBottom: '3rem', textAlign: centered ? 'center' : 'left', maxWidth: centered ? 580 : undefined, margin: centered ? '0 auto 3rem' : '0 0 3rem' }}>
      <div className="rh-badge rh-badge-primary" style={{ marginBottom: '0.75rem' }}>{label}</div>
      <h2 className="rh-h2">{title}</h2>
      {subtitle && <p className="rh-body-lg" style={{ color: 'var(--rh-text-2)', marginTop: '0.75rem' }}>{subtitle}</p>}
    </div>
  )
}

export default function HomePage() {
  const { t } = useLang()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <>
        <Navbar />
        <main className="rh-container" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
          <p aria-live="polite" style={{ color: 'var(--rh-text-2)' }}>Memuat ruang perjalanan...</p>
        </main>
      </>
    )
  }

  if (user && (!profile || profile.role === 'passenger')) {
    return <PassengerDashboard />
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

  return (
    <div>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="rh-hero">
        <div className="rh-pattern-dots" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />

        {/* Decorative orbs */}
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, hsla(215,90%,52%,0.15) 0%, transparent 70%)',
          top: -100, right: -50, pointerEvents: 'none'
        }} />

        <div className="rh-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            {/* Left: Headlines */}
            <div className="animate-fade-in">
              <div className="rh-badge" style={{
                background: 'rgba(255,255,255,0.1)', color: 'var(--rh-accent)',
                border: '1px solid rgba(255,255,255,0.15)', marginBottom: '1.5rem'
              }}>
                🚆 Railway Super App — Pulau Jawa
              </div>
              <h1 className="rh-h1" style={{ color: 'white', marginBottom: '1.25rem', maxWidth: 460 }}>
                {t.hero.title}
              </h1>
              <p className="rh-body-lg" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', maxWidth: 400 }}>
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
              <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem', flexWrap: 'wrap' }}>
                {STATS.map(({ value, label }) => (
                  <div key={label}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--rh-accent)' }}>{value}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.55)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Search Card */}
            <div className="animate-slide-right rh-hide-mobile">
              <div className="rh-search-card">
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--rh-text)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Train size={20} style={{ color: 'var(--rh-primary)' }} />
                  {t.hero.searchTitle}
                </h3>
                <SearchWidget />
              </div>
            </div>
          </div>

          {/* Mobile Search (below headlines) */}
          <div className="rh-show-mobile-only" style={{ marginTop: '2rem' }}>
            <div className="rh-search-card">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Train size={18} style={{ color: 'var(--rh-primary)' }} />
                {t.hero.searchTitle}
              </h3>
              <SearchWidget />
            </div>
          </div>
        </div>
      </section>

      {/* ── POPULAR ROUTES ───────────────────────────────── */}
      <section className="rh-section" style={{ background: 'var(--rh-white)' }}>
        <div className="rh-container">
          <SectionTitle
            label="Rute Populer"
            title="Destinasi Favorit Penumpang"
            subtitle="Pilih rute perjalanan kereta api paling diminati di Pulau Jawa."
            centered
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
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
                      <div style={{ fontSize: '0.8125rem', color: 'var(--rh-text-3)' }}>{route.duration}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--rh-primary)', fontWeight: 700 }}>{route.price}</span>
                    <ChevronRight size={16} style={{ color: 'var(--rh-text-3)' }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED TRAINS ──────────────────────────────── */}
      <section className="rh-section" style={{ background: 'var(--rh-surface)' }}>
        <div className="rh-container">
          <SectionTitle
            label="Armada Kereta"
            title="Kereta Unggulan RAILHUB"
            subtitle="Lima kereta terbaik yang melayani koridor utama Pulau Jawa."
            centered
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {TRAINS.map((train) => (
              <div key={train.name} className="rh-card rh-card-interactive">
                <div style={{
                  height: 6, background: train.color,
                  borderRadius: '12px 12px 0 0'
                }} />
                <div className="rh-card-body">
                  <div style={{ marginBottom: '0.75rem' }}>
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
                  <div style={{ fontSize: '0.8125rem', color: 'var(--rh-text-3)', marginBottom: '0.5rem' }}>{train.class}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--rh-text-2)' }}>
                    <MapPin size={12} /> {train.route}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section className="rh-section" style={{ background: 'var(--rh-navy)' }}>
        <div className="rh-container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="rh-badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--rh-accent)', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '0.75rem' }}>
              Mengapa RAILHUB?
            </div>
            <h2 className="rh-h2" style={{ color: 'white', maxWidth: 500, margin: '0 auto 0.75rem' }}>Pengalaman Perjalanan yang Berbeda</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.0625rem', maxWidth: 420, margin: '0 auto' }}>
              Dirancang untuk memenuhi semua kebutuhan perjalanan kereta api Anda dalam satu platform.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{
                padding: '1.75rem',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.25s',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, marginBottom: '1.25rem',
                  background: 'linear-gradient(135deg, var(--rh-primary), hsl(215,90%,38%))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'var(--shadow-primary)'
                }}>
                  <Icon size={24} color="white" />
                </div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'white', marginBottom: '0.625rem' }}>{title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ONBOARD SERVICES ─────────────────────────────── */}
      <section className="rh-section" style={{ background: 'var(--rh-white)' }}>
        <div className="rh-container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <SectionTitle
                label="Layanan di Kereta"
                title="Perjalanan yang Lebih Nyaman"
                subtitle="Nikmati berbagai layanan premium selama perjalanan Anda bersama RAILHUB."
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { icon: Wifi, title: 'Pelacakan Real-Time', desc: 'Lacak posisi kereta dan status perjalanan secara live.' },
                  { icon: Utensils, title: 'Pesan Makanan', desc: 'Order makanan dari menu pilihan langsung dari kursi Anda.' },
                  { icon: Luggage, title: 'Laporan Bantuan', desc: 'Hubungi petugas kapan saja untuk bantuan selama perjalanan.' },
                  { icon: Award, title: 'Reward Points', desc: 'Kumpulkan poin setiap perjalanan dan tukarkan hadiah menarik.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, background: 'var(--rh-primary-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <Icon size={20} style={{ color: 'var(--rh-primary)' }} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, color: 'var(--rh-text)', marginBottom: '0.25rem' }}>{title}</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--rh-text-2)', margin: 0 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Card */}
            <div style={{ position: 'relative' }}>
              <div className="rh-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, var(--rh-navy) 0%, var(--rh-navy-mid) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div className="rh-logo-mark"><Train size={16} strokeWidth={2.5} /></div>
                  <span style={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>RAILHUB App</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {['Perjalanan Aktif', 'Tiket Digital', 'Reward: 1,250 pts', 'Notifikasi Baru: 3'].map((item, i) => (
                    <div key={item} style={{
                      padding: '0.875rem 1rem',
                      background: 'rgba(255,255,255,0.07)',
                      borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', gap: '0.75rem'
                    }}>
                      <CheckCircle size={16} style={{ color: 'var(--rh-accent)', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {TESTIMONIALS.map(({ name, city, rating, text }) => (
              <div key={name} className="rh-card rh-card-interactive">
                <div className="rh-card-body">
                  <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} size={16} fill="var(--rh-accent)" stroke="var(--rh-accent)" />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--rh-text-2)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                    &ldquo;{text}&rdquo;
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--rh-primary), hsl(215,90%,38%))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '0.9rem'
                    }}>
                      {name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--rh-text)' }}>{name}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--rh-text-3)' }}>{city}</div>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
            {FAQS.map(({ q, a }) => (
              <div key={q} className="rh-card">
                <div className="rh-card-body">
                  <h4 style={{ fontWeight: 700, color: 'var(--rh-text)', marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--rh-primary)', fontSize: '1.1em' }}>Q.</span> {q}
                  </h4>
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
      <section style={{ background: 'linear-gradient(135deg, var(--rh-primary) 0%, hsl(215,90%,38%) 100%)', padding: '5rem 0' }}>
        <div className="rh-container" style={{ textAlign: 'center' }}>
          <h2 className="rh-h2" style={{ color: 'white', marginBottom: '1rem' }}>
            Siap Memulai Perjalanan?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.0625rem', marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
            Daftar sekarang dan nikmati kemudahan memesan tiket kereta api se-Pulau Jawa.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
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
