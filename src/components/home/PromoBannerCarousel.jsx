'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLang } from '@/contexts/LangContext'

const BANNERS = [
  {
    id: 'promo-weekend',
    href: '/trains',
    image: '/images/promo railhub.png',
    title: 'Promo Akhir Pekan Hemat',
    titleEn: 'Weekend Getaway Sale',
    alt: 'Promo Akhir Pekan Hemat Diskon s.d. 50% RAILHUB',
    altEn: 'Weekend Getaway Promo Up to 50% Off RAILHUB',
  },
  {
    id: 'diskon-mahasiswa',
    href: '/trains',
    image: '/images/diskon railhub mahasiswa.png',
    title: 'Diskon Mahasiswa 20%',
    titleEn: '20% Student Discount',
    alt: 'Liburan Kuliah Lebih Hemat Diskon 20% Khusus Mahasiswa RAILHUB',
    altEn: 'College Holiday Discount 20% for University Students RAILHUB',
  },
  {
    id: 'tarif-reduksi',
    href: '/trains',
    image: '/images/Railhub Tarif Reduksi Kereta.png',
    title: 'Tarif Reduksi Kereta Api',
    titleEn: 'Reduced Railway Fare',
    alt: 'Tarif Reduksi Kereta Api Diskon Tarif hingga 50% untuk Lansia, Veteran, TNI/Polri, dan Wartawan RAILHUB',
    altEn: 'Reduced Train Fare Up to 50% for Seniors, Veterans, Military, Police & Journalists RAILHUB',
  },
]

export default function PromoBannerCarousel() {
  const { lang } = useLang()
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartRef = useRef(null)
  const touchDeltaRef = useRef(0)

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % BANNERS.length)
  }, [])

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + BANNERS.length) % BANNERS.length)
  }, [])

  // Auto-play interval (pauses on hover or touch)
  useEffect(() => {
    if (paused) return undefined
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    const timer = setInterval(() => {
      nextSlide()
    }, 5500)

    return () => clearInterval(timer)
  }, [paused, nextSlide])

  // Touch swipe handling for mobile
  const handleTouchStart = (e) => {
    setPaused(true)
    touchStartRef.current = e.touches[0].clientX
    touchDeltaRef.current = 0
  }

  const handleTouchMove = (e) => {
    if (touchStartRef.current === null) return
    touchDeltaRef.current = touchStartRef.current - e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    setPaused(false)
    const delta = touchDeltaRef.current
    const threshold = 40 // minimum swipe distance in px

    if (delta > threshold) {
      nextSlide()
    } else if (delta < -threshold) {
      prevSlide()
    }

    touchStartRef.current = null
    touchDeltaRef.current = 0
  }

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      prevSlide()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      nextSlide()
    }
  }

  return (
    <section
      className="rh-home-banners"
      aria-label={lang === 'en' ? 'Travel promotions' : 'Promo perjalanan kereta'}
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false)
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
    >
      <div
        className="rh-home-banner-viewport"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="rh-home-banner-track"
          style={{
            transform: `translateX(-${activeIndex * 100}%)`,
          }}
        >
          {BANNERS.map((banner, index) => {
            const title = lang === 'en' ? banner.titleEn : banner.title
            const alt = lang === 'en' ? banner.altEn : banner.alt
            const isCurrent = activeIndex === index

            return (
              <div
                key={banner.id}
                className="rh-home-banner-slide"
                aria-hidden={!isCurrent}
              >
                <Link
                  href={banner.href}
                  className="rh-home-banner-link"
                  aria-label={title}
                  tabIndex={isCurrent ? 0 : -1}
                >
                  <img
                    src={encodeURI(banner.image)}
                    alt={alt}
                    className="rh-home-banner-img"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    draggable={false}
                  />
                </Link>
              </div>
            )
          })}
        </div>

        {/* Desktop Prev Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            prevSlide()
          }}
          className="rh-home-banner-nav rh-home-banner-nav-prev"
          aria-label={lang === 'en' ? 'Previous promo banner' : 'Banner promo sebelumnya'}
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>

        {/* Desktop Next Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            nextSlide()
          }}
          className="rh-home-banner-nav rh-home-banner-nav-next"
          aria-label={lang === 'en' ? 'Next promo banner' : 'Banner promo berikutnya'}
        >
          <ChevronRight size={22} strokeWidth={2.5} />
        </button>
      </div>

      {/* Pagination Dots */}
      <div
        className="rh-home-banner-dots"
        role="group"
        aria-label={lang === 'en' ? 'Choose promotion' : 'Pilih promo'}
      >
        {BANNERS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-label={`${lang === 'en' ? item.titleEn : item.title} (${index + 1}/${BANNERS.length})`}
            aria-current={activeIndex === index ? 'true' : undefined}
            onClick={() => setActiveIndex(index)}
          >
            <span />
          </button>
        ))}
      </div>
    </section>
  )
}
