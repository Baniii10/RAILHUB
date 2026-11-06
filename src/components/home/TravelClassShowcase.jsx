'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  Armchair,
  Train,
  Sparkles,
  Briefcase,
  Check,
  ChevronRight,
} from 'lucide-react'
import { useLang } from '@/contexts/LangContext'

const TRAVEL_CLASSES = [
  {
    id: 'luxury',
    title: 'Luxury Sleeper',
    badge: 'Kenyamanan Tertinggi',
    badgeEn: 'Ultimate Luxury',
    badgeColor: '#b45309',
    price: 'Mulai Rp 450.000',
    priceEn: 'From Rp 450.000',
    image: '/images/kelas-luxury.webp',
    fallbackBg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
    icon: Armchair,
    quickChips: ['Recline 140°', 'Layar VOD', 'Free Meal & Snack'],
    quickChipsEn: ['140° Recline', 'Personal VOD', 'Free Meal & Snack'],
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
    badgeEn: 'Most Popular',
    badgeColor: '#1a428a',
    price: 'Mulai Rp 250.000',
    priceEn: 'From Rp 250.000',
    image: '/images/interior-eksekutif.webp',
    fallbackBg: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
    icon: Train,
    quickChips: ['Captain Seat 2-2', 'Rotasi 180°', 'WiFi Kabin'],
    quickChipsEn: ['Captain Seat 2-2', '180° Rotating', 'Cabin WiFi'],
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
    badgeEn: 'Flexible Choice',
    badgeColor: '#0369a1',
    price: 'Mulai Rp 180.000',
    priceEn: 'From Rp 180.000',
    image: '/images/kelas-bisnis.webp',
    fallbackBg: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #38bdf8 100%)',
    icon: Briefcase,
    quickChips: ['Formasi 2-2', 'Pijakan Kaki', 'Akses Resto'],
    quickChipsEn: ['2-2 Seating', 'Footrest', 'Dining Access'],
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
    badgeEn: 'Affordable & Modern',
    badgeColor: '#047857',
    price: 'Mulai Rp 120.000',
    priceEn: 'From Rp 120.000',
    image: '/images/interior-ekonomi.webp',
    fallbackBg: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #34d399 100%)',
    icon: Sparkles,
    quickChips: ['Individual Recline', 'Hadap Depan', 'Fast USB Port'],
    quickChipsEn: ['Individual Recline', 'Forward Facing', 'Fast USB Port'],
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
  const [activeIdx, setActiveIdx] = useState(0)
  const sliderRef = useRef(null)

  function handleImageError(id) {
    setImgErrors(prev => ({ ...prev, [id]: true }))
  }

  function handleScroll() {
    if (!sliderRef.current) return
    const el = sliderRef.current
    const card = el.querySelector('.rh-class-showcase-card')
    if (!card) return
    const cardWidth = card.offsetWidth + 14
    const newIdx = Math.round(el.scrollLeft / cardWidth)
    if (newIdx !== activeIdx && newIdx >= 0 && newIdx < TRAVEL_CLASSES.length) {
      setActiveIdx(newIdx)
    }
  }

  function scrollToIndex(idx) {
    if (!sliderRef.current) return
    const el = sliderRef.current
    const card = el.querySelector('.rh-class-showcase-card')
    if (!card) return
    const cardWidth = card.offsetWidth + 14
    el.scrollTo({
      left: idx * cardWidth,
      behavior: 'smooth',
    })
    setActiveIdx(idx)
  }

  return (
    <section id="travel-classes" className="rh-section" style={{ background: '#f8fafc', paddingTop: '2.5rem', paddingBottom: '3rem' }}>
      <div className="rh-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: 999, background: 'rgba(26, 66, 138, 0.08)', color: 'var(--rh-primary)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Train size={14} />
            <span>{lang === 'en' ? 'Fleet & Comfort' : 'Armada & Kelas Kereta'}</span>
          </div>

          <h2 className="rh-h2" style={{ margin: '0 0 0.5rem', color: 'var(--rh-navy)', fontSize: 'clamp(1.4rem, 3.5vw, 1.85rem)', fontWeight: 800 }}>
            {lang === 'en' ? 'Choose Your Level of Comfort' : 'Pilihan Kelas Perjalanan Anda'}
          </h2>

          <p style={{ margin: '0 auto', maxWidth: 580, color: 'var(--rh-text-2)', fontSize: '0.92rem', lineHeight: 1.55 }}>
            {lang === 'en'
              ? 'From the private luxury of Sleeper cabins to ergonomic New Generation economy, explore Indonesia with utmost style and comfort.'
              : 'Mulai dari kemewahan kabin privat Sleeper hingga efisiensi ergonomis Ekonomi New Gen, temukan kenyamanan perjalanan terbaik Anda.'}
          </p>
        </div>

        {/* Classes Carousel / Grid */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="rh-class-showcase-slider"
        >
          {TRAVEL_CLASSES.map(cls => {
            const hasError = imgErrors[cls.id]
            const Icon = cls.icon
            const features = lang === 'en' ? cls.featuresEn : cls.features
            const chips = lang === 'en' ? cls.quickChipsEn : cls.quickChips
            const badgeLabel = lang === 'en' ? cls.badgeEn : cls.badge

            return (
              <article
                key={cls.id}
                className="rh-card rh-class-showcase-card"
              >
                {/* Hero Photo Banner - FOTO UTAMA LEBIH MENONJOL DI MOBILE */}
                <div className="rh-class-card-hero">
                  {!hasError ? (
                    <img
                      src={cls.image}
                      alt={`Interior ${cls.title}`}
                      onError={() => handleImageError(cls.id)}
                      className="rh-class-card-img"
                    />
                  ) : (
                    <div className="rh-class-card-img-fallback" style={{ background: cls.fallbackBg }}>
                      <div className="rh-class-fallback-icon">
                        <Icon size={26} color="#ffffff" />
                      </div>
                      <strong style={{ fontSize: '1rem', letterSpacing: '0.02em', color: '#fff' }}>{cls.title}</strong>
                    </div>
                  )}

                  {/* Gradient Overlay for Contrast */}
                  <div className="rh-class-card-gradient" />

                  

                  {/* Title overlay directly on photo for Mobile Hero Effect */}
                  <div className="rh-class-hero-overlay-title">
                    <h3 className="rh-class-title-text">
                      {cls.title}
                    </h3>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="rh-class-card-body">
                  {/* Desktop Description (Hidden on mobile) */}
                  <p className="rh-class-desktop-desc">
                    {lang === 'en' ? cls.descriptionEn : cls.description}
                  </p>

                  {/* Mobile Quick Chips (Concise highlights instead of wall of text) */}
                  <div className="rh-class-chips-row">
                    {chips.map((chip, cIdx) => (
                      <span key={cIdx} className="rh-class-chip">
                        {chip}
                      </span>
                    ))}
                  </div>

                  {/* Desktop 4 Feature Bullets (Hidden on mobile) */}
                  <ul className="rh-class-desktop-features">
                    {features.map((feat, fIdx) => (
                      <li key={fIdx} className="rh-class-feature-item">
                        <span className="rh-class-check-circle">
                          <Check size={12} strokeWidth={3} />
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <Link
                    href={`/trains?class=${encodeURIComponent(cls.id)}`}
                    className="rh-btn rh-btn-primary rh-class-action-btn"
                  >
                    <span>{lang === 'en' ? `Book ${cls.title}` : `Pilih Tiket ${cls.title}`}</span>
                    <ChevronRight size={15} />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>

        {/* Mobile Swipe Indicators (Dots) */}
        <div className="rh-class-mobile-dots rh-show-mobile-only">
          {TRAVEL_CLASSES.map((cls, idx) => (
            <button
              key={cls.id}
              type="button"
              onClick={() => scrollToIndex(idx)}
              aria-label={`Lihat kelas ${cls.title}`}
              className={`rh-class-dot ${activeIdx === idx ? 'is-active' : ''}`}
            />
          ))}
        </div>

        {/* Bottom Link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <Link
            href="/trains"
            style={{
              fontSize: '0.875rem',
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
