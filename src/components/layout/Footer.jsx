'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Train, MapPin, Clock, Mail, Phone } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// --- SOCIAL MEDIA VECTOR ICONS (Matching reference orange/coral outline style) ---
function IconThreads({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 1-6 0v-1a6 6 0 1 1 2 4.4" />
    </svg>
  )
}

function IconFacebook({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function IconInstagram({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function IconTikTok({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  )
}

function IconYouTube({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="15" x="2" y="4.5" rx="4" />
      <polygon points="10 9 15 12 10 15 10 9" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconXTwitter({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l6.5 7.5L4 20h3l5-6 5 6h4l-6.8-8.1L20 4h-3l-4.7 5.5L7.5 4H4z" />
    </svg>
  )
}

// --- PAYMENT BADGE VECTOR ICONS (Matching reference: AMEX, VISA, Mastercard, QRIS) ---
function LogoAmex() {
  return (
    <div
      style={{
        width: 38,
        height: 24,
        background: '#D9222A',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 900,
        fontSize: '0.55rem',
        letterSpacing: '-0.02em',
        userSelect: 'none',
      }}
      title="American Express"
      aria-label="American Express"
    >
      AMEX
    </div>
  )
}

function LogoVisa() {
  return (
    <svg width="42" height="24" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Visa" title="Visa">
      <text x="2" y="19" fill="#1A1F71" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontStyle="italic" fontSize="21" letterSpacing="0.04em">VISA</text>
    </svg>
  )
}

function LogoMastercard() {
  return (
    <svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Mastercard" title="Mastercard">
      <circle cx="13" cy="12" r="9" fill="#EB001B" />
      <circle cx="23" cy="12" r="9" fill="#F79E1B" fillOpacity="0.88" />
    </svg>
  )
}

function LogoQris() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAF5F5',
        border: '1px solid #F0C4C4',
        borderRadius: 4,
        padding: '2px 5px',
        height: 24,
        userSelect: 'none',
      }}
      title="QRIS (Quick Response Code Indonesian Standard)"
      aria-label="QRIS"
    >
      <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#C01A27', letterSpacing: '0.04em' }}>QRIS</span>
    </div>
  )
}

export default function Footer() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isRestricted = pathname?.startsWith('/dashboard') || pathname?.startsWith('/booking')

  // Always hide on restricted routes (dashboard & booking)
  if (isRestricted) {
    return null
  }

  // Once mounted on client, hide if user is logged in
  if (mounted && user) {
    return null
  }

  const socialLinks = [
    { name: 'Threads', icon: IconThreads, href: 'https://threads.net' },
    { name: 'Facebook', icon: IconFacebook, href: 'https://facebook.com' },
    { name: 'Instagram', icon: IconInstagram, href: 'https://instagram.com' },
    { name: 'TikTok', icon: IconTikTok, href: 'https://tiktok.com' },
    { name: 'YouTube', icon: IconYouTube, href: 'https://youtube.com' },
    { name: 'X', icon: IconXTwitter, href: 'https://x.com' },
  ]

  // Menu yang benar-benar ada di website RAILHUB
  const layananLinks = [
    { label: 'Cari Tiket Kereta', href: '/trains' },
    { label: 'Pilih Kursi Gerbong', href: '/trains' },
    { label: 'E-Boarding Pass', href: '/dashboard/passenger' },
    { label: 'Lacak Kereta (Live)', href: '/dashboard/passenger' },
    { label: 'Restorasi On-Board', href: '/dashboard/orders' },
  ]

  const informasiLinks = [
    { label: 'Beranda', href: '/about' },
    { label: 'Tentang RAILHUB', href: '/about' },
    { label: 'Bantuan & FAQ', href: '/faq' },
    { label: 'Syarat & Ketentuan', href: '/faq' },
    { label: 'Kebijakan Privasi', href: '/faq' },
    { label: 'Kontak Pelanggan', href: '/contact' },
  ]

  const membershipLinks = [
    { label: 'Masuk / Login', href: '/auth/login' },
    { label: 'Daftar Akun', href: '/auth/register' },
    { label: 'Tiket Saya', href: '/dashboard/passenger' },
    { label: 'Pesanan Kuliner', href: '/dashboard/orders' },
  ]

  return (
    <footer
      style={{
        background: '#ffffff',
        color: '#4B5563',
        borderTop: '1px solid #E5E7EB',
        position: 'relative',
        zIndex: 10,
        fontSize: '0.875rem',
      }}
    >
      <div className="rh-container rh-footer-container">
        {/* Main 5-Column Grid Layout matching the reference layout strictly with authentic site features */}
        <div
          className="rh-footer-main-grid"
          style={{
            alignItems: 'start',
          }}
        >
          {/* Column 1: Brand, Tagline, Socials, Payments */}
          <div style={{ maxWidth: '280px' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',
              }}
            >
              <Image
                src="/images/Fix logo railhub.png"
                alt="RAILHUB"
                width={950}
                height={275}
                unoptimized
                style={{
                  height: '40px',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </Link>

            <p
              style={{
                margin: '1.1rem 0 1.25rem 0',
                color: '#4B5563',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              Sistem Informasi &amp; Reservasi Kereta Api Pulau Jawa
            </p>

            {/* Social Media Icons row (orange outline icons) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
                marginBottom: '1.5rem',
              }}
            >
              {socialLinks.map(({ name, icon: IconComponent, href }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    border: '1.5px solid #FF8C00',
                    color: '#FF8C00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FF8C00'
                    e.currentTarget.style.color = '#ffffff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#FF8C00'
                  }}
                >
                  <IconComponent size={16} />
                </a>
              ))}
            </div>

            {/* Payment Logos row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                flexWrap: 'wrap',
              }}
            >
              <LogoAmex />
              <LogoVisa />
              <LogoMastercard />
              <LogoQris />
            </div>
          </div>

          {/* Column 2: Layanan */}
          <div>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '1.25rem',
                marginTop: 0,
              }}
            >
              Layanan
            </h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {layananLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    style={{
                      color: '#4B5563',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FF8C00')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#4B5563')}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Informasi */}
          <div>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '1.25rem',
                marginTop: 0,
              }}
            >
              Informasi
            </h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {informasiLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    style={{
                      color: '#4B5563',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FF8C00')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#4B5563')}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Membership / Akun */}
          <div>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '1.25rem',
                marginTop: 0,
              }}
            >
              Membership
            </h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {membershipLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    style={{
                      color: '#4B5563',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FF8C00')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#4B5563')}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Kontak */}
          <div style={{ maxWidth: '280px' }}>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '1.25rem',
                marginTop: 0,
              }}
            >
              Kontak
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#4B5563' }}>
              {/* Address */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <MapPin size={20} color="#FF8C00" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.875rem', lineHeight: 1.45 }}>
                  Stasiun Gambir &amp; Senen, Jakarta Pusat, DKI Jakarta 10410
                </span>
              </div>

              {/* Operating Hours */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Clock size={20} color="#FF8C00" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.875rem', lineHeight: 1.45 }}>
                  24 Jam Setiap Hari (Layanan Operasional Kereta)
                </span>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Mail size={20} color="#FF8C00" style={{ flexShrink: 0 }} />
                <a
                  href="mailto:support@railhub.id"
                  style={{
                    color: '#4B5563',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#FF8C00')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#4B5563')}
                >
                  Kirim E-mail (support@railhub.id)
                </a>
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Phone size={20} color="#FF8C00" style={{ flexShrink: 0 }} />
                <a
                  href="tel:121"
                  style={{
                    color: '#4B5563',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#FF8C00')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#4B5563')}
                >
                  121 / 0812-3456-7890
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & legal disclaimer bar */}
        <div
          style={{
            marginTop: '3rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            fontSize: '0.8rem',
            color: '#6B7280',
          }}
        >
          <div>
            © 2026 RAILHUB - Kelompok 14. Proyek Pemrograman Web.
          </div>
          <div>
            Simulasi Edukasi Kereta Api · Bukan Situs Resmi PT KAI
          </div>
        </div>
      </div>
    </footer>
  )
}
