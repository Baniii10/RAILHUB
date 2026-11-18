'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/contexts/LangContext'

const BANNERS = [
  {
    id: 'schedule',
    href: '/trains',
    title: 'Diskon 25% tiket eksekutif',
    titleEn: '25% off executive tickets',
    description: 'Perjalanan pilihan di Pulau Jawa dengan kabin yang lebih nyaman.',
    descriptionEn: 'Selected journeys across Java with a more comfortable cabin.',
    background: 'linear-gradient(118deg, #071A38 0%, #123E80 58%, #2E70C8 100%)',
  },
  {
    id: 'tracking',
    href: '/trains',
    title: 'Hemat Rp75.000 untuk rute antarkota',
    titleEn: 'Save Rp75,000 on intercity routes',
    description: 'Tersedia untuk jadwal pilihan Jakarta, Yogyakarta, dan Surabaya.',
    descriptionEn: 'Available on selected Jakarta, Yogyakarta, and Surabaya schedules.',
    background: 'linear-gradient(118deg, #10245F 0%, #3246B8 52%, #8A4FD4 100%)',
  },
  {
    id: 'ticket',
    href: '/trains',
    title: 'Satu booking untuk perjalanan keluarga',
    titleEn: 'One booking for family journeys',
    description: 'Atur hingga enam penumpang dan simpan tiket digital bersama.',
    descriptionEn: 'Manage up to six passengers and keep digital tickets together.',
    background: 'linear-gradient(118deg, #0B304A 0%, #087B83 56%, #19A98E 100%)',
  },
]

function BannerArtwork({ type }) {
  if (type === 'tracking') {
    return (
      <svg viewBox="0 0 640 240" role="img" aria-label="Ilustrasi pelacakan perjalanan kereta">
        <path d="M20 62C116 18 197 91 292 47C386 4 483 18 620 84V240H20Z" fill="#C85CE8" opacity=".35" />
        <path d="M28 132C140 66 224 162 338 91C431 33 510 69 626 30" fill="none" stroke="#FFF" strokeWidth="5" strokeLinecap="round" opacity=".45" />
        <g fill="#FFF"><circle cx="65" cy="112" r="8" /><circle cx="338" cy="91" r="8" /><circle cx="585" cy="42" r="8" /></g>
        <g transform="translate(270 79) rotate(-8)">
          <rect width="218" height="74" rx="18" fill="#EAF4FF" />
          <path d="M20 9H156C184 9 205 28 214 52L218 65H20Z" fill="#2559B6" />
          <path d="M161 17C180 19 195 31 203 47H168L145 17Z" fill="#0B244E" />
          <path d="M28 52H211L218 65H20Z" fill="#F59E0B" />
          <g fill="#A9D7FF"><rect x="34" y="20" width="30" height="19" rx="5" /><rect x="74" y="20" width="30" height="19" rx="5" /><rect x="114" y="20" width="24" height="19" rx="5" /></g>
          <g fill="#071A38"><circle cx="58" cy="68" r="13" /><circle cx="174" cy="68" r="13" /></g>
          <g fill="#BED6EA"><circle cx="58" cy="68" r="6" /><circle cx="174" cy="68" r="6" /></g>
        </g>
      </svg>
    )
  }

  if (type === 'ticket') {
    return (
      <svg viewBox="0 0 640 240" role="img" aria-label="Ilustrasi tiket digital kereta">
        <circle cx="464" cy="118" r="112" fill="#6EE7C4" opacity=".25" />
        <g transform="translate(214 25) rotate(-5 170 90)">
          <path d="M18 0H322C322 12 330 20 342 20V160C330 160 322 168 322 180H18C18 168 10 160 0 160V20C10 20 18 12 18 0Z" fill="#F8FAFC" />
          <path d="M220 16V164" stroke="#BFD5D8" strokeWidth="3" strokeDasharray="8 8" />
          <rect x="28" y="28" width="112" height="12" rx="6" fill="#0B304A" />
          <rect x="28" y="57" width="158" height="9" rx="4.5" fill="#B5C9CE" />
          <rect x="28" y="78" width="132" height="9" rx="4.5" fill="#D4E2E5" />
          <path d="M30 130H177" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" />
          <g fill="#0B304A"><rect x="248" y="35" width="18" height="18" /><rect x="272" y="35" width="10" height="10" /><rect x="292" y="35" width="22" height="22" /><rect x="248" y="59" width="10" height="24" /><rect x="266" y="57" width="22" height="12" /><rect x="294" y="65" width="20" height="18" /><rect x="248" y="91" width="22" height="22" /><rect x="278" y="79" width="10" height="34" /><rect x="296" y="91" width="18" height="22" /></g>
          <rect x="248" y="132" width="66" height="9" rx="4.5" fill="#19A98E" />
        </g>
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 640 240" role="img" aria-label="Ilustrasi jadwal dan kereta antarkota">
      <circle cx="493" cy="74" r="102" fill="#67B7FF" opacity=".2" />
      <path d="M0 189H640V240H0Z" fill="#06152D" opacity=".7" />
      <path d="M0 197H640M0 220H640" stroke="#B7D9F4" strokeWidth="5" opacity=".6" />
      <g transform="translate(232 74)">
        <path d="M0 35H254C294 35 330 57 346 90L356 113H0Z" fill="#EDF7FF" />
        <path d="M256 46C292 49 318 67 335 94H273L235 46Z" fill="#0B244E" />
        <path d="M0 91H344L356 113H0Z" fill="#F59E0B" />
        <path d="M0 84H340" stroke="#2467C7" strokeWidth="8" />
        <g fill="#77B7EE"><rect x="28" y="52" width="40" height="22" rx="5" /><rect x="82" y="52" width="40" height="22" rx="5" /><rect x="136" y="52" width="40" height="22" rx="5" /><rect x="190" y="52" width="30" height="22" rx="5" /></g>
        <g fill="#071A38"><circle cx="70" cy="114" r="18" /><circle cx="270" cy="114" r="18" /></g>
        <g fill="#B7D9F4"><circle cx="70" cy="114" r="8" /><circle cx="270" cy="114" r="8" /></g>
      </g>
      <g transform="translate(67 47)">
        <rect width="180" height="92" rx="14" fill="#071A38" stroke="#74C0FC" strokeWidth="2" />
        <circle cx="20" cy="20" r="6" fill="#22C55E" />
        <rect x="34" y="15" width="108" height="10" rx="5" fill="#74C0FC" />
        <rect x="18" y="43" width="94" height="9" rx="4.5" fill="#FDE68A" />
        <rect x="128" y="43" width="32" height="9" rx="4.5" fill="#22C55E" />
        <rect x="18" y="66" width="128" height="7" rx="3.5" fill="#8CA6C1" />
      </g>
    </svg>
  )
}

export default function PromoBannerCarousel() {
  const { lang } = useLang()
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = window.setInterval(() => setActiveIndex(index => (index + 1) % BANNERS.length), 6500)
    return () => window.clearInterval(timer)
  }, [paused])

  const banner = BANNERS[activeIndex]
  const title = lang === 'en' ? banner.titleEn : banner.title
  const description = lang === 'en' ? banner.descriptionEn : banner.description

  return (
    <section
      className="rh-home-banners"
      aria-label={lang === 'en' ? 'Travel promotions' : 'Promo perjalanan kereta'}
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
      }}
    >
      <Link key={banner.id} href={banner.href} className="rh-home-banner" style={{ background: banner.background }} aria-label={`${title}. ${description}`}>
        <span className="rh-home-banner-copy"><strong>{title}</strong><span>{description}</span></span>
        <span className="rh-home-banner-art" aria-hidden="true"><BannerArtwork type={banner.id} /></span>
      </Link>

      <div className="rh-home-banner-dots" role="group" aria-label={lang === 'en' ? 'Choose promotion' : 'Pilih promo'}>
        {BANNERS.map((item, index) => (
          <button key={item.id} type="button" aria-label={`${lang === 'en' ? item.titleEn : item.title} (${index + 1}/${BANNERS.length})`} aria-current={activeIndex === index ? 'true' : undefined} onClick={() => setActiveIndex(index)}>
            <span />
          </button>
        ))}
      </div>
    </section>
  )
}
