'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Train, MapPin, Clock, Mail, Phone } from 'lucide-react'

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
  const [isConsole, setIsConsole] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname || ''
      if (path.startsWith('/dashboard/admin') || path.startsWith('/dashboard/staff')) {
        setIsConsole(true)
      }
    }
  }, [])

  // Suppress public marketing footer in dedicated staff and admin operational consoles
  if (isConsole) {
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

  const layananLinksCol1 = [
    { label: 'Kereta Antar Kota', href: '/trains' },
    { label: 'Kereta Komuter', href: '/trains' },
    { label: 'LRT Jabodebek', href: '/trains' },
    { label: 'Kereta Bandara', href: '/trains' },
  ]

  const layananLinksCol2 = [
    { label: 'Kereta Panoramic', href: '/trains' },
    { label: 'Luxury & Priority', href: '/trains' },
    { label: 'Wisata Kereta', href: '/about' },
    { label: 'RailFood On-Board', href: '/contact' },
  ]

  const produkLinks = [
    { label: 'Tiket Reguler', href: '/trains' },
    { label: 'Tiket Wisata', href: '/trains' },
    { label: 'Pengiriman Kargo', href: '/contact' },
    { label: 'RailPay E-Wallet', href: '/dashboard/passenger' },
    { label: 'Asuransi Perjalanan', href: '/faq' },
    { label: 'Porter Stasiun', href: '/faq' },
  ]

  const informasiLinks = [
    { label: 'Berita & Info', href: '/about' },
    { label: 'Peta Stasiun', href: '/trains' },
    { label: 'Syarat & Ketentuan', href: '/faq' },
    { label: 'Kebijakan Privacy', href: '/faq' },
    { label: 'Feedback', href: '/contact' },
    { label: 'Careers', href: '/about' },
  ]

  const membershipLinks = [
    { label: 'Login', href: '/auth/login' },
    { label: 'Daftar', href: '/auth/register' },
    { label: 'Tiket Saya', href: '/dashboard/passenger' },
    { label: 'Lacak Kereta', href: '/dashboard/passenger' },
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
        {/* Main 6-Column Grid Layout matching the reference image */}
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
                gap: '0.65rem',
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #1A428A 0%, #0F2D6B 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 4px 10px rgba(26, 66, 138, 0.25)',
                }}
              >
                <Train size={20} strokeWidth={2.4} />
              </div>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  color: '#1A428A',
                }}
              >
                RAIL<span style={{ color: '#FF8C00' }}>HUB</span>
              </span>
            </Link>

            <p
              style={{
                margin: '1.1rem 0 1.25rem 0',
                color: '#4B5563',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              Platform Reservasi & Layanan Kereta Api Terbaik di Indonesia
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

          {/* Column 2: Layanan (Split into 2 subcolumns like reference) */}
          <div style={{ minWidth: '220px' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.25rem' }}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {layananLinksCol1.map((item) => (
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
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {layananLinksCol2.map((item) => (
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
          </div>

          {/* Column 3: Produk */}
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
              Produk
            </h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {produkLinks.map((item) => (
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

          {/* Column 4: Informasi */}
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

          {/* Column 5: Membership */}
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

          {/* Column 6: Kontak */}
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
                  Kantor Operasional RAILHUB, Jl. Stasiun Senen No. 1, Jakarta Pusat, DKI Jakarta 10410
                </span>
              </div>

              {/* Operating Hours */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Clock size={20} color="#FF8C00" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.875rem', lineHeight: 1.45 }}>
                  09:00–20:00 (Weekday) &amp; 09:00–17:00 (Weekend)
                </span>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Mail size={20} color="#FF8C00" style={{ flexShrink: 0 }} />
                <a
                  href="mailto:cs@railhub.id"
                  style={{
                    color: '#4B5563',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#FF8C00')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#4B5563')}
                >
                  Kirim E-mail
                </a>
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Phone size={20} color="#FF8C00" style={{ flexShrink: 0 }} />
                <a
                  href="tel:081266100500"
                  style={{
                    color: '#4B5563',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#FF8C00')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#4B5563')}
                >
                  081266100500
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
            © 2026 RAILHUB — Kelompok 14. Proyek Pemrograman Web.
          </div>
          <div>
            Simulasi Edukasi Kereta Api · Bukan Situs Resmi PT KAI
          </div>
        </div>
      </div>
    </footer>
  )
}
