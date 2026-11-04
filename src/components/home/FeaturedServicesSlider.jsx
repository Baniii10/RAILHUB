'use client'

import Link from 'next/link'
import { Radio, QrCode, UtensilsCrossed, Armchair, CreditCard } from 'lucide-react'
import { useLang } from '@/contexts/LangContext'

const SERVICES = [
  {
    id: 'live-tracking',
    titleId: 'Live Tracking',
    titleEn: 'Live Tracking',
    descId: 'Pantau posisi & laju KA',
    descEn: 'Real-time train status',
    icon: Radio,
    color: '#2563eb',
    bg: '#eff6ff',
    href: '/trains',
  },
  {
    id: 'e-boarding',
    titleId: 'E-Boarding Pass',
    titleEn: 'E-Boarding Pass',
    descId: 'Scan QR gate stasiun',
    descEn: 'Paperless digital gate',
    icon: QrCode,
    color: '#059669',
    bg: '#ecfdf5',
    href: '/dashboard/passenger',
  },
  {
    id: 'onboard-dining',
    titleId: 'Kuliner Kereta',
    titleEn: 'Onboard Dining',
    descId: 'Diantar ke nomor kursi',
    descEn: 'Food delivered to seat',
    icon: UtensilsCrossed,
    color: '#ea580c',
    bg: '#fff7ed',
    href: '/dashboard/orders',
  },
  {
    id: 'seat-selection',
    titleId: 'Pilih Kursi',
    titleEn: 'Seat Selection',
    descId: 'Denah gerbong interaktif',
    descEn: 'Choose window or aisle',
    icon: Armchair,
    color: '#7c3aed',
    bg: '#f5f3ff',
    href: '/trains',
  },
  {
    id: 'instant-payment',
    titleId: 'Bayar Instan',
    titleEn: 'Instant Payment',
    descId: 'QRIS & Virtual Account',
    descEn: 'QRIS & Virtual Account',
    icon: CreditCard,
    color: '#0891b2',
    bg: '#ecfeff',
    href: '/trains',
  },
]

export default function FeaturedServicesSlider() {
  const { lang } = useLang()

  return (
    <section className="rh-services-dock-section" style={{ background: '#f8fafc', padding: '1.5rem 0 2rem', borderBottom: '1px solid var(--rh-border)' }}>
      <div className="rh-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <h2 style={{
            margin: 0,
            fontSize: '0.82rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--rh-text-3)',
          }}>
            {lang === 'en' ? 'Core Railway Services' : 'Layanan Terpadu RAILHUB'}
          </h2>
          <span className="rh-hide-mobile" style={{ fontSize: '0.78rem', color: 'var(--rh-text-3)' }}>
            {lang === 'en' ? 'Direct self-service access' : 'Akses mandiri praktis'}
          </span>
        </div>

        <div className="rh-services-dock-track">
          {SERVICES.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.id}
                href={item.href}
                className="rh-service-tile"
              >
                <div
                  className="rh-service-tile-icon"
                  style={{ background: item.bg, color: item.color }}
                >
                  <Icon size={18} strokeWidth={2.2} />
                </div>
                <div className="rh-service-tile-text">
                  <span className="rh-service-tile-title">
                    {lang === 'en' ? item.titleEn : item.titleId}
                  </span>
                  <span className="rh-service-tile-desc">
                    {lang === 'en' ? item.descEn : item.descId}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
