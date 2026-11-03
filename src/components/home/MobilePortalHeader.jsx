'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LangContext'
import {
  IconAntarKota,
  IconLokal,
  IconKomuter,
  IconLRT,
  IconBandara,
  IconSpaceByRail,
  IconGrabFeeder,
  IconMultiTrip,
  IconLebihBanyak,
  LocomotiveIllustration,
} from '@/components/ui/VectorLogos'
import {
  Bell,
  ChevronRight,
  Sparkles,
  ShoppingBag,
} from 'lucide-react'

export default function MobilePortalHeader() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { lang, toggleLang } = useLang()

  // Dynamic time greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour >= 4 && hour < 11) return 'Selamat Pagi'
    if (hour >= 11 && hour < 15) return 'Selamat Siang'
    if (hour >= 15 && hour < 18) return 'Selamat Sore'
    return 'Selamat Malam'
  }, [])

  const displayName = profile?.full_name?.split(' ')[0] || (user ? 'Pengguna' : 'Tamu')

  const SERVICES = [
    {
      id: 'antar-kota',
      title: 'Antar Kota',
      href: '/trains',
      icon: IconAntarKota,
      bg: 'linear-gradient(135deg, #1A428A 0%, #2A5CB5 100%)',
    },
    {
      id: 'lokal',
      title: 'Lokal',
      href: '/trains?from=BD&to=CCL&date=2026-11-04&pax=1',
      icon: IconLokal,
      bg: 'linear-gradient(135deg, #FF8C00 0%, #FFA834 100%)',
    },
    {
      id: 'komuter',
      title: 'Komuter',
      href: '/trains?from=MRI&to=BOP&date=2026-11-04&pax=1',
      icon: IconKomuter,
      bg: 'linear-gradient(135deg, #A83232 0%, #D34545 100%)',
    },
    {
      id: 'lrt',
      title: 'LRT',
      href: '/trains?from=MRI&to=JNG&date=2026-11-04&pax=1',
      icon: IconLRT,
      bg: 'linear-gradient(135deg, #8B258F 0%, #AF3DB5 100%)',
    },
    {
      id: 'bandara',
      title: 'Bandara',
      href: '/trains?from=MRI&to=GMR&date=2026-11-04&pax=1',
      icon: IconBandara,
      bg: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
    },
    {
      id: 'space',
      title: 'Space By RH',
      href: '/about',
      icon: IconSpaceByRail,
      bg: '#F8FAFC',
      border: '1.5px solid #E2E8F0',
    },
    {
      id: 'grab',
      title: 'Feeder Mobil',
      href: '/contact',
      icon: IconGrabFeeder,
      bg: '#F8FAFC',
      border: '1.5px solid #E2E8F0',
    },
    {
      id: 'kmt',
      title: 'Kartu Multi Trip',
      href: user ? '/dashboard/passenger' : '/auth/login?next=/dashboard/passenger',
      icon: IconMultiTrip,
      bg: '#F8FAFC',
      border: '1.5px solid #E2E8F0',
    },
    {
      id: 'more',
      title: 'Lebih Banyak',
      href: '/faq',
      icon: IconLebihBanyak,
      bg: '#F8FAFC',
      border: '1.5px solid #E2E8F0',
    },
  ]

  return (
    <section
      aria-label="Portal Akses Cepat RAILHUB"
      style={{
        background: 'linear-gradient(180deg, #12306A 0%, #1A428A 45%, #E7ECF6 100%)',
        color: '#ffffff',
        padding: '1.15rem 0.85rem 1.25rem',
        borderRadius: 20,
        marginBottom: '1rem',
        boxShadow: '0 8px 24px rgba(18, 48, 106, 0.12)',
      }}
    >
      <div style={{ maxWidth: 840, margin: '0 auto' }}>
        {/* Top Greeting Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.85rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
              {greeting}
            </div>
            <h1
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0.1rem 0 0',
                letterSpacing: '-0.02em',
              }}
            >
              {displayName}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* My Bookings / Cart */}
            <Link
              href={user ? '/dashboard/passenger#my-bookings' : '/auth/login'}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
              aria-label="Tiket Saya"
            >
              <ShoppingBag size={17} />
            </Link>

            {/* Notifications */}
            <Link
              href={user ? '/dashboard/passenger' : '/about'}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
              aria-label="Pemberitahuan"
            >
              <Bell size={17} />
            </Link>

            {/* Language Flag Badge */}
            <button
              type="button"
              onClick={toggleLang}
              style={{
                height: 38,
                borderRadius: 20,
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0 0.75rem',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              aria-label="Ganti Bahasa"
            >
              <span>🇮🇩</span>
              <span>{lang.toUpperCase()}</span>
            </button>
          </div>
        </div>

        {/* ============================================================
            SERVICE CATEGORIES (Screenshot 1: 9 Circular Vector Badges in Elevated White Card)
            ============================================================ */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 18,
            padding: '1.15rem 0.75rem 1rem',
            marginBottom: '1rem',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '1.15rem 0.35rem',
              textAlign: 'center',
            }}
          >
            {SERVICES.map(srv => {
              const Icon = srv.icon
              return (
                <Link
                  key={srv.id}
                  href={srv.href}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textDecoration: 'none',
                    gap: '0.45rem',
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      background: srv.bg,
                      border: srv.border || 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.06)',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <Icon size={24} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#1E293B',
                      lineHeight: 1.25,
                      maxWidth: 68,
                    }}
                  >
                    {srv.title}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* ============================================================
            LIVE TRACKING BANNER CARD (Screenshot 1 Locomotive Card)
            ============================================================ */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1A428A 0%, #2A5CB5 50%, #4F46E5 100%)',
            borderRadius: 18,
            padding: '1.25rem 1.25rem',
            boxShadow: '0 8px 24px rgba(26, 66, 138, 0.25)',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
            alignItems: 'center',
            gap: '1rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>Live Tracking</span>
              <span
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 700,
                  background: '#ffffff',
                  color: 'var(--rh-primary)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                Baru <Sparkles size={11} style={{ color: 'var(--rh-accent)' }} />
              </span>
            </div>
            <p
              style={{
                fontSize: '0.8rem',
                color: 'rgba(255, 255, 255, 0.9)',
                margin: '0 0 0.875rem',
                lineHeight: 1.35,
              }}
            >
              Lihat lokasi dan status perjalanan kereta kamu secara real-time.
            </p>
            <Link
              href={user ? '/dashboard/passenger' : '/trains'}
              className="rh-btn rh-btn-sm"
              style={{
                background: '#ffffff',
                color: 'var(--rh-primary)',
                fontWeight: 700,
                fontSize: '0.78rem',
                borderRadius: 20,
                padding: '0.45rem 1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
            >
              Buka Live Tracking
            </Link>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <LocomotiveIllustration width={150} height={85} />
          </div>
        </div>
      </div>
    </section>
  )
}

