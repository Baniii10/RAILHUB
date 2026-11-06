'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Armchair,
  Train,
  Sparkles,
  Briefcase,
  Check,
  ChevronRight,
  Wifi,
  Tv,
  Coffee,
  BatteryCharging,
  ShieldCheck,
} from 'lucide-react'
import { useLang } from '@/contexts/LangContext'

const TRAVEL_CLASSES = [
  {
    id: 'luxury',
    title: 'Luxury Sleeper',
    badge: 'Kenyamanan Tertinggi',
    badgeColor: '#b45309',
    badgeBg: 'rgba(245, 158, 11, 0.12)',
    price: 'Mulai Rp 450.000',
    priceEn: 'From Rp 450.000',
    image: '/images/kelas-luxury.webp',
    fallbackBg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
    icon: Armchair,
    description: 'Pengalaman perjalanan paling eksklusif dengan privasi maksimal dan layanan setara first-class penerbangan internasional.',
    descriptionEn: 'The most exclusive travel experience with maximum privacy and first-class airline standard service.',
    features: [
      'Kursi electric sleeper rebah hingga 140°',
      'Layar sentuh VOD pribadi + earphone premium',
      'Free warm meal, snack box & welcome drink',
      'Lampu baca personal & USB charging port',
    ],
    featuresEn: [
      'Electric sleeper seat recline up to 140°',
      'Personal touch VOD screen + premium headset',
      'Free warm meal, snack box & welcome drink',
      'Personal reading light & fast charging port',
    ],
  },
  {
    id: 'eksekutif',
    title: 'Eksekutif',
    badge: 'Paling Populer',
    badgeColor: '#1a428a',
    badgeBg: 'rgba(26, 66, 138, 0.12)',
    price: 'Mulai Rp 250.000',
    priceEn: 'From Rp 250.000',
    image: '/images/interior-eksekutif.webp', // File exists in public/images
    fallbackBg: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
    icon: Train,
    description: 'Pilihan utama perjalanan dinas dan liburan keluarga dengan ruang kaki super lega dan kursi captain seat yang dapat diputar.',
    descriptionEn: 'The top choice for business and family travel with extra legroom and rotating captain seats.',
    features: [
      'Captain seat 2-2 reclining & rotating 180°',
      'Meja kerja lipat ergonomis & stopkontak tiap kursi',
      'WiFi kabin kecepatan tinggi & AC dingin sejuk',
      'Bantal dan selimut higienis disediakan',
    ],
    featuresEn: [
      'Captain seat 2-2 reclining & 180° rotating',
      'Folding work table & power outlet at each seat',
      'High-speed cabin WiFi & cool air conditioning',
      'Hygienic pillow and blanket provided',
    ],
  },
  {
    id: 'bisnis',
    title: 'Bisnis',
    badge: 'Pilihan Fleksibel',
    badgeColor: '#0369a1',
    badgeBg: 'rgba(2, 132, 199, 0.12)',
    price: 'Mulai Rp 180.000',
    priceEn: 'From Rp 180.000',
    image: '/images/kelas-bisnis.webp',
    fallbackBg: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #38bdf8 100%)',
    icon: Briefcase,
    description: 'Kombinasi ideal antara kenyamanan perjalanan antarkota dan efisiensi biaya dengan interior kabin yang lapang.',
    descriptionEn: 'The ideal combination of intercity travel comfort and cost efficiency with a spacious cabin interior.',
    features: [
      'Formasi kursi 2-2 empuk dengan sandaran tangan',
      'Ruang kaki lega dan pijakan kaki (footrest)',
      'Bagasi kabin atas yang luas untuk koper',
      'Akses mudah ke kereta restorasi makan & minum',
    ],
    featuresEn: [
      'Comfortable 2-2 seating with armrests',
      'Generous legroom and adjustable footrest',
      'Spacious overhead luggage racks',
      'Easy access to onboard dining carriage',
    ],
  },
  {
    id: 'ekonomi',
    title: 'Ekonomi New Gen',
    badge: 'Terjangkau & Modern',
    badgeColor: '#047857',
    badgeBg: 'rgba(5, 150, 105, 0.12)',
    price: 'Mulai Rp 120.000',
    priceEn: 'From Rp 120.000',
    image: '/images/interior-ekonomi.webp', // File exists in public/images
    fallbackBg: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #34d399 100%)',
    icon: Sparkles,
    description: 'Revolusi kelas ekonomi dengan kursi individual reclining seat yang menghadap searah laju kereta untuk kenyamanan maksimal.',
    descriptionEn: 'Revolutionary economy class with individual reclining seats facing the direction of travel.',
    features: [
      'Kursi individual 2-2 reclining (bukan kursi tegak)',
      'Semua kursi menghadap searah laju kereta api',
      'Kabin kedap suara & pencahayaan LED hangat',
      'Port pengisian daya USB & Type-C fast charging',
    ],
    featuresEn: [
      'Individual 2-2 reclining seats (no fixed upright)',
      'All seats face the direction of train travel',
      'Soundproof cabin & warm LED ambient lights',
      'USB & Type-C fast charging ports at each row',
    ],
  },
]

export default function TravelClassShowcase() {
  const { lang } = useLang()
  const [imgErrors, setImgErrors] = useState({})

  function handleImageError(id) {
    setImgErrors(prev => ({ ...prev, [id]: true }))
  }

  return (
    <section className="rh-section home-classes-showcase" style={{ background: '#ffffff', paddingTop: '2.5rem', paddingBottom: '3rem' }}>
      <div className="rh-container">
        {/* Header Title & Subtitle: Craft-floor - No banned kicker, balanced line length */}
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 2.25rem' }}>
          <h2 className="rh-h2" style={{ margin: '0 0 0.75rem', color: 'var(--rh-navy)', fontSize: 'clamp(1.4rem, 2.7vw, 2rem)', fontWeight: 800, letterSpacing: '-0.025em' }}>
            {lang === 'en' ? 'Choose Your Travel Class' : 'Pilihan Kelas Kereta Api'}
          </h2>
          <p style={{ margin: '0 auto', maxWidth: '52ch', color: 'var(--rh-text-2)', fontSize: '0.94rem', lineHeight: 1.6, textWrap: 'balance' }}>
            {lang === 'en'
              ? 'Enjoy the best intercity journey with our modern fleet designed to match your vacation, family, and business needs.'
              : 'Nikmati kenyamanan perjalanan antarkota terbaik dengan pilihan armada modern sesuai gaya liburan, keluarga, dan dinas bisnis Anda.'}
          </p>
        </div>

        {/* 4 Class Cards Grid with Photos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 270px), 1fr))', gap: '1.25rem' }}>
          {TRAVEL_CLASSES.map(cls => {
            const hasError = imgErrors[cls.id]
            const Icon = cls.icon
            const features = lang === 'en' ? cls.featuresEn : cls.features

            return (
              <article
                key={cls.id}
                className="rh-card rh-card-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 0,
                  overflow: 'hidden',
                  background: '#ffffff',
                  border: '1px solid var(--rh-border)',
                  borderRadius: 18,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                }}
              >
                {/* Card Image Banner */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: 190,
                    background: cls.fallbackBg,
                    overflow: 'hidden',
                  }}
                >
                  {!hasError ? (
                    <img
                      src={cls.image}
                      alt={`Interior ${cls.title}`}
                      onError={() => handleImageError(cls.id)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.35s ease',
                      }}
                    />
                  ) : (
                    /* Fallback Illustration Banner if image not yet filled in public/ */
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        textAlign: 'center',
                        padding: '1rem',
                        position: 'relative',
                      }}
                    >
                      <div style={{ position: 'absolute', inset: 0, opacity: 0.15, background: 'radial-gradient(circle at 50% 50%, #ffffff, transparent)' }} />
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'grid', placeItems: 'center', marginBottom: 8, backdropFilter: 'blur(4px)' }}>
                        <Icon size={26} color="#ffffff" />
                      </div>
                      <strong style={{ fontSize: '1rem', letterSpacing: '0.02em' }}>{cls.title}</strong>
                      <span style={{ fontSize: '0.74rem', opacity: 0.85, marginTop: 2 }}>Foto interior kabin resmi</span>
                    </div>
                  )}

                  {/* Gradient shadow overlay for text contrast */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.65) 100%)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Class Badge (Top-Left) */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      padding: '0.3rem 0.75rem',
                      borderRadius: 8,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(6px)',
                      color: cls.badgeColor,
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {cls.badge}
                  </div>

                  {/* Price Tag (Bottom-Right overlay) */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      padding: '0.35rem 0.85rem',
                      borderRadius: 8,
                      background: 'rgba(15, 23, 42, 0.9)',
                      backdropFilter: 'blur(6px)',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  >
                    {lang === 'en' ? cls.priceEn : cls.price}
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                    <h3 className="rh-h4" style={{ margin: 0, fontSize: '1.2rem', color: 'var(--rh-navy)', fontWeight: 800 }}>
                      {cls.title}
                    </h3>
                  </div>

                  <p style={{ margin: '0 0 1rem', color: 'var(--rh-text-2)', fontSize: '0.875rem', lineHeight: 1.55, flex: '0 0 auto' }}>
                    {lang === 'en' ? cls.descriptionEn : cls.description}
                  </p>

                  {/* Feature Bullets */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem', display: 'grid', gap: '0.5rem', flex: 1 }}>
                    {features.map((feat, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', color: '#334155', lineHeight: 1.45 }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(5, 150, 105, 0.12)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          <Check size={12} strokeWidth={3} />
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <Link
                    href={`/trains?class=${encodeURIComponent(cls.id)}`}
                    className="rh-btn rh-btn-primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      padding: '0.7rem 1rem',
                      borderRadius: 10,
                      textDecoration: 'none',
                      gap: '0.35rem',
                      fontWeight: 700,
                    }}
                  >
                    <span>{lang === 'en' ? `Book ${cls.title}` : `Pilih Tiket ${cls.title}`}</span>
                    <ChevronRight size={15} />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>

        {/* Bottom Link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <Link
            href="/trains"
            style={{
              fontSize: '0.85rem',
              color: 'var(--rh-primary)',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>{lang === 'en' ? 'Explore all active train schedules' : 'Lihat Seluruh Jadwal Kereta Aktif'}</span>
            <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  )
}

