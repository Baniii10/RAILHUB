'use client'

import Link from 'next/link'
import { Train } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const FOOTER_LINKS = [
  { href: '/trains', label: 'Cari Kereta' },
  { href: '/about', label: 'Tentang' },
  { href: '/faq', label: 'Bantuan & FAQ' },
  { href: '/contact', label: 'Kontak' },
  { href: '/dashboard/passenger', label: 'Tiket Saya' },
]

export default function Footer() {
  const { user, loading } = useAuth()

  if (loading || user) return null

  return (
    <footer
      style={{
        background: 'var(--rh-navy)',
        color: 'rgba(255, 255, 255, 0.75)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div className="rh-container rh-footer-container">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
          }}
        >
          {/* Brand & Tagline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/" className="rh-logo" style={{ color: 'white', textDecoration: 'none' }}>
              <div className="rh-logo-mark" style={{ width: 32, height: 32 }}>
                <Train size={16} strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '-0.02em' }}>RAILHUB</span>
            </Link>
            <span style={{ color: 'rgba(255, 255, 255, 0.25)' }} className="rh-hide-mobile">|</span>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              Sistem Informasi & Reservasi Kereta Api
            </span>
          </div>

          {/* Clean Inline Navigation Links */}
          <nav
            aria-label="Footer Navigasi"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.85rem 1.25rem',
              fontSize: '0.825rem',
            }}
          >
            {FOOTER_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: 'rgba(255, 255, 255, 0.75)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'color 0.15s ease',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Minimal Copyright Strip */}
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.45)',
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
