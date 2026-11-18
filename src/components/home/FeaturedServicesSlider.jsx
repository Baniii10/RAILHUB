'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLang } from '@/contexts/LangContext'
import {
  VectorLiveRadar,
  VectorPassengerBoarding,
  VectorSeatComfort,
  VectorStaffDining,
  VectorStaffServing,
} from './RailhubServiceVectors'

const SERVICES = [
  {
    id: 'e-boarding',
    titleId: 'E-Boarding & Tiket QR',
    titleEn: 'QR E-Boarding Pass',
    descId: 'Scan QR cepat di gate stasiun tanpa perlu cetak tiket fisik.',
    descEn: 'Fast paperless QR gate boarding at every station.',
    href: '/dashboard/passenger',
    Vector: VectorPassengerBoarding,
  },
  {
    id: 'onboard-dining',
    titleId: 'Kuliner On-Board',
    titleEn: 'On-Board Dining',
    descId: 'Pesan hidangan favorit, diantar prama langsung ke nomor kursi.',
    descEn: 'Order meals delivered straight to your train seat.',
    href: '/dashboard/orders',
    Vector: VectorStaffDining,
  },
  {
    id: 'staff-service',
    titleId: 'Pelayanan Petugas Terpadu',
    titleEn: 'Integrated Station Care',
    descId: 'Sinergi petugas gate dan kondektur untuk perjalanan aman & nyaman.',
    descEn: 'Gate & conductor staff synergy for seamless boarding.',
    href: '/trains',
    Vector: VectorStaffServing,
  },
  {
    id: 'seat-selection',
    titleId: 'Pilih Kursi Gerbong',
    titleEn: 'Interactive Seat Map',
    descId: 'Pilih posisi jendela atau lorong dari denah gerbong interaktif.',
    descEn: 'Pick window or aisle seats on an interactive coach map.',
    href: '/trains',
    Vector: VectorSeatComfort,
  },
  {
    id: 'live-tracking',
    titleId: 'Live Tracking & QRIS',
    titleEn: 'Live Tracking & QRIS',
    descId: 'Pantau posisi kereta real-time dan bayar instan via QRIS.',
    descEn: 'Track train status in real time with instant QRIS payment.',
    href: '/trains',
    Vector: VectorLiveRadar,
  },
]

export default function FeaturedServicesSlider({ isDay = true }) {
  const { lang } = useLang()
  const [desktopPage, setDesktopPage] = useState(0)
  const [desktopDir, setDesktopDir] = useState(1)
  const [mobileIndex, setMobileIndex] = useState(0)
  const [mobileDir, setMobileDir] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStartX, setTouchStartX] = useState(null)

  const desktopPages = [SERVICES.slice(0, 3), SERVICES.slice(2, 5)]

  // Automatic sliding every 4.5s on both desktop and mobile (pauses on hover/touch)
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setDesktopDir(1)
      setDesktopPage((p) => (p === 0 ? 1 : 0))
      setMobileDir(1)
      setMobileIndex((i) => (i === SERVICES.length - 1 ? 0 : i + 1))
    }, 4500)
    return () => clearInterval(timer)
  }, [isPaused])

  const goDesktopPage = (nextPage, dir) => {
    setDesktopDir(dir)
    setDesktopPage(nextPage)
  }

  const goMobileSlide = (nextIdx, dir) => {
    setMobileDir(dir)
    setMobileIndex(nextIdx)
  }

  const activeDesktopItems = desktopPages[desktopPage]
  const activeMobileItem = SERVICES[mobileIndex]
  const MobileVector = activeMobileItem.Vector

  return (
    <section
      aria-label={lang === 'en' ? 'Core Railway Services' : 'Layanan Terpadu RAILHUB'}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        background: isDay ? '#7dd3fc' : '#07162c',
        transition: 'background 0.5s ease',
      }}
      className="relative pt-2 sm:pt-3"
    >
      {/* Rounded White Arch Sheet rising smoothly out of the Day/Night Hero background */}
      <div
        className="bg-white rounded-t-[32px] sm:rounded-t-[44px] pt-7 sm:pt-9 pb-10 sm:pb-12 border-b border-[var(--rh-border)]"
        style={{
          boxShadow: isDay
            ? '0 -10px 30px rgba(2, 44, 102, 0.12)'
            : '0 -12px 34px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div className="rh-container relative">
          {/* Header cleanly INSIDE the rounded white box */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--rh-orange)] mb-1">
              {lang === 'en' ? 'Integrated Ecosystem' : 'Layanan Terpadu RAILHUB'}
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-[var(--rh-blue)] m-0">
              {lang === 'en'
                ? 'Built for Passengers & Crew'
                : 'Melayani dari Stasiun hingga Kursi'}
            </h2>
          </div>
          {/* Desktop / iPad View (3 columns, smooth horizontal slide between Page 1 & Page 2) */}
          <div className="hidden md:block relative">
            <div className="overflow-hidden px-12">
              <AnimatePresence mode="wait" custom={desktopDir}>
                <motion.div
                  key={desktopPage}
                  custom={desktopDir}
                  initial={{ opacity: 0, x: desktopDir > 0 ? 48 : -48 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: desktopDir > 0 ? -48 : 48 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="grid grid-cols-3 gap-8"
                >
                  {activeDesktopItems.map((item) => {
                    const Vector = item.Vector
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="group flex flex-col items-center text-center no-underline px-2"
                      >
                        <div className="transition-transform duration-300 group-hover:-translate-y-1.5">
                          <Vector />
                        </div>
                        <h3 className="text-base font-extrabold text-[var(--rh-blue)] mt-3 mb-1.5 group-hover:text-[var(--rh-orange)] transition-colors">
                          {lang === 'en' ? item.titleEn : item.titleId}
                        </h3>
                        <p className="text-xs sm:text-sm text-[var(--rh-text)] opacity-80 m-0 leading-relaxed max-w-[260px]">
                          {lang === 'en' ? item.descEn : item.descId}
                        </p>
                      </Link>
                    )
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Desktop Circular Left/Right Arrows */}
            <button
              type="button"
              onClick={() => goDesktopPage(desktopPage === 0 ? 1 : 0, -1)}
              aria-label="Layanan sebelumnya"
              className="absolute left-0 top-[42%] -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-[var(--rh-border)] shadow-sm flex items-center justify-center text-[var(--rh-blue)] cursor-pointer hover:border-[var(--rh-blue)] transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => goDesktopPage(desktopPage === 1 ? 0 : 1, 1)}
              aria-label="Layanan berikutnya"
              className="absolute right-0 top-[42%] -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-[var(--rh-border)] shadow-sm flex items-center justify-center text-[var(--rh-blue)] cursor-pointer hover:border-[var(--rh-blue)] transition-colors"
            >
              <ChevronRight size={18} />
            </button>

            {/* Desktop Dots */}
            <div className="flex items-center justify-center gap-2 mt-7">
              {[0, 1].map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goDesktopPage(idx, idx > desktopPage ? 1 : -1)}
                  aria-label={`Halaman layanan ${idx + 1}`}
                  className={`h-2 rounded-full border-0 cursor-pointer transition-all ${
                    desktopPage === idx
                      ? 'w-6 bg-[var(--rh-orange)]'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Mobile View (Single centered character with auto-slide + finger swipe) */}
          <div
            className="md:hidden"
            onTouchStart={(e) => {
              setIsPaused(true)
              setTouchStartX(e.touches[0].clientX)
            }}
            onTouchEnd={(e) => {
              if (touchStartX !== null) {
                const dx = e.changedTouches[0].clientX - touchStartX
                if (dx < -40) {
                  goMobileSlide(mobileIndex === SERVICES.length - 1 ? 0 : mobileIndex + 1, 1)
                } else if (dx > 40) {
                  goMobileSlide(mobileIndex === 0 ? SERVICES.length - 1 : mobileIndex - 1, -1)
                }
              }
              setTouchStartX(null)
              setTimeout(() => setIsPaused(false), 1500)
            }}
          >
            <div className="relative overflow-hidden px-10">
              <AnimatePresence mode="wait" custom={mobileDir}>
                <motion.div
                  key={mobileIndex}
                  custom={mobileDir}
                  initial={{ opacity: 0, x: mobileDir > 0 ? 44 : -44 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: mobileDir > 0 ? -44 : 44 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center text-center"
                >
                  <Link
                    href={activeMobileItem.href}
                    className="flex flex-col items-center text-center no-underline"
                  >
                    <MobileVector />
                    <h3 className="text-base font-extrabold text-[var(--rh-blue)] mt-2.5 mb-1">
                      {lang === 'en' ? activeMobileItem.titleEn : activeMobileItem.titleId}
                    </h3>
                    <p className="text-xs text-[var(--rh-text)] opacity-80 m-0 leading-relaxed max-w-[260px]">
                      {lang === 'en' ? activeMobileItem.descEn : activeMobileItem.descId}
                    </p>
                  </Link>
                </motion.div>
              </AnimatePresence>

              <button
                type="button"
                onClick={() =>
                  goMobileSlide(mobileIndex === 0 ? SERVICES.length - 1 : mobileIndex - 1, -1)
                }
                aria-label="Layanan sebelumnya"
                className="absolute left-0 top-20 w-9 h-9 rounded-full bg-white border border-[var(--rh-border)] shadow-sm flex items-center justify-center text-[var(--rh-blue)] cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() =>
                  goMobileSlide(mobileIndex === SERVICES.length - 1 ? 0 : mobileIndex + 1, 1)
                }
                aria-label="Layanan berikutnya"
                className="absolute right-0 top-20 w-9 h-9 rounded-full bg-white border border-[var(--rh-border)] shadow-sm flex items-center justify-center text-[var(--rh-blue)] cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Mobile Dots */}
            <div className="flex items-center justify-center gap-1.5 mt-5">
              {SERVICES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goMobileSlide(idx, idx > mobileIndex ? 1 : -1)}
                  aria-label={s.titleId}
                  className={`h-2 rounded-full border-0 cursor-pointer transition-all ${
                    mobileIndex === idx
                      ? 'w-5 bg-[var(--rh-orange)]'
                      : 'w-2 bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
